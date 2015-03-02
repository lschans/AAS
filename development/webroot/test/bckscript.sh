#!/bin/bash
# vim: set filetype=sh :
# vim: set number :
# vim: set nowrap :
# vim: set textwidth=0 wrapmargin=0 :

# Declare paths to all binaries used in this script because the cron runs without a real environment  
MOUNT_POINT="/"													# Mount point backups are stored on
																		#
BACKUP_PATH="home/tmp/"											# Backup path relative to mount point [e.g: home/backups/]
TMP_PATH="tmp/"													# Temp path relative to mount point [e.g: tmp/]
																		#
MIN_DISK="250000"													# Min. amount of availible disk space required to perform backups in kilobyte
																		#
MAX_LOAD="4.5"														# Max load level that the system must be below to perform backups
SLEEP_TIME="15"													# Sleep time in seconds to wait when the server has a high load
																		#
ARCH="/bin/gzip -9 -c"											# Primary compression utility (typicaly tar) - include arguments!!
ARCH_EXT="sql.gz"													# File extention for the primary compression utility
																		#
NICE_PRI="16"														# Priority to run backups as. 21 = lowest priority, -19 = highest
																		# [NOTE: setting below value of 0 can damage the system.]
																		#
DATE_FORMAT="%Y-%m-%d"											# Date format used to name folders
																		#
AWK="/usr/bin/awk"												# Path to 'awk' binary
BC="/usr/bin/bc"													# Path to 'bc' binary
CAT="/bin/cat"														# Path to 'cat' binary
CUT="/usr/bin/cut"												# Path to 'cut' binary
DATE="/bin/date"													# Path to 'date' binary
DF="/bin/df"														# Path to 'df' binary
ECHO="/bin/echo"													# Path to 'echo' binary
FIND="/usr/bin/find"												# Path to 'find' binary
GREP="/bin/grep"													# Path to 'grep' binary
MKFIFO="/usr/bin/mkfifo"										# Path to 'mkfifo' binary
MYSQLDUMP="/usr/local/bin/mysqldump"						# Path to 'mysqldump' binary
MYSQL="/usr/local/bin/mysql"									# Path to 'mysql' binary
NICE="/usr/bin/nice"												# Path to 'nice' binary
RM="/bin/rm"														# Path to 'rm' binary
SED="/bin/sed"														# Path to 'sed' binary
SLEEP="/bin/sleep"												# Path to 'sleep' binary
SORT="/usr/bin/sort"												# Path to 'sort' binary
TAIL="/usr/bin/tail"												# Path to 'tail' binary
XARGS="/usr/bin/xargs"											# Path to 'xargs' binary
																		#
MYSQL_USER="admin"												# mySQL username
MYSQL_PASS="ynDKdCIW"											# mySQL password
MYSQL_EXCLUDE=( "information_schema" "Database" "mysql" "test" )		# Declare array with databases to exclude

ADMIN_MAIL="info@wodanbrothers.com"												# Email address of the admin to mail if an error occurs
LOG_FILE="/home/admin/backup_script/awesome_backup.log"					# Path to logfile
LOG_TMP="/home/admin/backup_script/awesome_backup.tmp"					# Path to temp logfile

TODAY=$(${DATE} +${DATE_FORMAT})
MONTH_AGO=$(${DATE} +${DATE_FORMAT} --date="last month")
TODAY_DIR=${MOUNT_POINT}${BACKUP_PATH}${TODAY}
MONTH_AGO_DIR=${MOUNT_POINT}${BACKUP_PATH}${MONTH_AGO}

declare -A LOGSHTABLES
LOGSHTABLES["iclock_attendence_logsh"]="1 year";
LOGSHTABLES["dysc_user_contracts_logsh"]="3 year";
LOGSHTABLES["dysc_users_logsh"]="3 year";
LOGSHTABLES["dor_user_profile_logsh"]="3 year";
LOGSHTABLES["cc_messages_logsh"]="3 months";
LOGSHTABLES["dor_assignments_logsh"]="1 month";
LOGSHTABLES["dor_register_logsh"]="6 months";
LOGSHTABLES["job_logsh"]="2 weeks";
LOGSHTABLES["sc_lib_logsh"]="1 month";

################## DONT EDIT BELOW THIS POINT ############################################################################


################## FUNCTIONS #############################################################################################

QUERYARRAY=()
array=()

function mysql_query	{
	mysql -u $MYSQL_USER -p$MYSQL_PASS<<<"$1";
}  

function mysql_array	{
	read -ra array <<< $(mysql -u $MYSQL_USER -p$MYSQL_PASS<<<"$1")
}

function clean {
	line="USE $database; DELETE FROM $1 WHERE $2" 
	QUERYARRAY+=("$line")
}

function addJob {
	database=$1
	hasJob=$(mysql_query "USE $database; SHOW TABLES;" | ${GREP} job)
	QUERYARRAY+=("USE $1;")
	if [[ $hasJob = "job" ]]
	then #Job table found add some records
		#Minute Jobs
		clean job "execute_after < NOW() - INTERVAL 1 DAY AND next_job = '+1 minute';"		

		#Weekly jobs
		clean job "execute_after < NOW() - INTERVAL 1 WEEK;"

		#Rexomatic jobs
		clean job "job_actor = 'rexomatic' AND execute_after < NOW() - INTERVAL 1 DAY;"
	fi

	# trx_transactions
	clean trx_transactions "created < NOW() - INTERVAL 1 MONTH;"

	# Iterate over logsh table to find old log sh
	for i in "${!LOGSHTABLES[@]}"
	do
		clean $i "date < '$(date --date="-${LOGSHTABLES[$i]}" +"%Y-%m-%d")';"
	done

#	unset LOGSHTABLES

	hasLogshLargeData=$(mysql_query "USE $database; SHOW TABLES;" | ${GREP} logsh_large_data)
	if [[ $hasLogshLargeData = "logsh_large_data" ]]
	then
		mysql_array "USE $database; SHOW TABLES;"
		for i in "${array[@]}"
		do
			if [[ $i =~ .*_logsh.* ]]
			then
				subArray+=("SELECT DISTINCT ldata_id FROM $i WHERE ldata_id > 0")
			fi
		done
		
		joinQuery=$(printf " UNION %s" "${subArray[@]}" | sed "s/^\ UNION\ //")
		mysql_array "USE $database; $joinQuery;"
		idList=$(printf ",%s" "${array[@]}" | sed "s/^\,ldata_id,//")
		if [[ $idList != , ]]
		then
			clean logsh_large_data "id NOT IN($idList)"
		fi
		unset array
		unset idList
		unset subArray
	fi
	unset hasLogshLargeData

	# Vectron clean job
	hasVectron=$(mysql_query "USE $database; SHOW TABLES;" | ${GREP} vectron_upload_logs)
	if [[ $hasVectron = "vectron_upload_logs" ]]
	then
		# Clean all vectron logs older then 1 months
		clean vectron_upload_logs "created < NOW() - INTERVAL 1 MONTH;"

		# Older than one week, just during daylight hours
		clean vectron_upload_logs "created < NOW() - INTERVAL 1 WEEK AND TIME(created) BETWEEN '12:00' AND '20:00';"

		# Remove double records
		mysql_array "USE $database; SELECT SUBSTR(GROUP_CONCAT(id), LOCATE(',', GROUP_CONCAT(id)) + 1) as id FROM vectron_upload_logs GROUP BY MD5(data) HAVING COUNT(*) > 1;"
		idList=$(printf ",%s" "${array[@]}" | sed "s/^\,id,//")
		#echo $idList
		if [[ $idList != , ]]
		then
			clean vectron_upload_logs "id IN ($idList);"
		fi
		unset array
		unset idList
	fi
	unset hasVectron	


	clean dor_assignments_snapshot "date < NOW() - INTERVAL 1 MONTH;"
	QUERYARRAY+=("USE $database; OPTIMIZE TABLE job;")
	QUERYARRAY+=("USE $database; OPTIMIZE TABLE vectron_upload_logs;")
	
}

################## END FUNCTIONS #########################################################################################

FREE_DISK=$(${DF} --total $MOUNT_POINT$BACKUP_PATH | ${SED} -n 3p | ${AWK} '{print $3}');

echo "$(${DATE}) - Backup process is started." >> ${LOG_FILE};

# Rotate logfile to a maximum of 500 lines
${TAIL} -n 500 ${LOG_FILE} > ${LOG_TMP}
${CAT} ${LOG_TMP} > ${LOG_FILE}
${RM} ${LOG_TMP}


# Remove all dirs that are older than 30 days in year 2014-2018, except for files ending with 01 ( First backup of the month )
${FIND} $MOUNT_POINT$BACKUP_PATH -mtime +30 -type d -regextype posix-egrep ! -regex ".*201[4-8]-[0-9]{2}-01" -print0 | ${XARGS} -0 ${RM} -Rf  2> /dev/null

# Test if there is enough space on the disk
if [[ $(${ECHO} "$MIN_DISK<$FREE_DISK" | bc -l) =~ 0 ]]; then
	# Send admin mail
	echo "Oopz some snafu and foobar happened during the backup ;)" | mail -s "Backup failed" ${ADMIN_MAIL}
	echo "$(date +"%m-%d-%y") -> Backup failed with a space issue :)" >> ${LOG_FILE}
	exit 0;
fi

# Calculate some stuff
LOAD_AVERAGE=$(${CAT} /proc/loadavg | ${CUT} -d ' ' -f 1);
MYSQL_DATABASES=( $(echo "show databases;" | ${MYSQL} -u $MYSQL_USER -p$MYSQL_PASS) );

# Substract excluded databases from all databases
MYSQL_BCK_DB=($(comm -23 <(echo ${MYSQL_DATABASES[@]} | ${SED} 's/ /\n/g' | ${SORT} -u) <(echo ${MYSQL_EXCLUDE[@]} | ${SED} 's/ /\n/g' | ${SORT} -u)));

mkdir -p ${TODAY_DIR}

{							# Keep the while loop in process substitution pipe
for DBi in "${MYSQL_BCK_DB[@]}"
do :
	LOAD_AVERAGE=$(${CAT} /proc/loadavg | ${CUT} -d ' ' -f 1);
	# Wait until the server load is acceptable
	{
	while true; 
		do :
		if [[ $(echo "$LOAD_AVERAGE<$MAX_LOAD" | ${BC} -l) =~ 1 ]]; then
	    		break
	  	fi
		echo "$($date) -> Load too high, sleeping." >> ${LOG_FILE}
		${SLEEP} ${SLEEP_TIME}
		LOAD_AVERAGE=$(${CAT} /proc/loadavg | ${CUT} -d ' ' -f 1);
	done
	}	
	#echo "mkfifo ${MOUNT_POINT}${TMP_PATH}mysql_pipe; $ARCH < ${MOUNT_POINT}${TMP_PATH}mysql_pipe > ${TODAY_DIR}$i.$ARCH_EXT &; $NICE -n $NICE_PRI mysqldump  -u $MYSQL_USER -p$MYSQL_PASS $i > ${MOUNT_POINT}${TMP_PATH}mysql_pipe; rm ${MOUNT_POINT}${TMP_PATH}mysql_pipe"

	# Optimize databases
	addJob $DBi;
	for q in "${QUERYARRAY[@]}"
	do :
		mysql_query "$q"
	done

	unset QUERYARRAY
	${RM} -f ${MOUNT_POINT}${TMP_PATH}mysql_pipe 2> /dev/null
	${MKFIFO} ${MOUNT_POINT}${TMP_PATH}mysql_pipe
	${ARCH} < ${MOUNT_POINT}${TMP_PATH}mysql_pipe > "${TODAY_DIR}/${DBi}.${ARCH_EXT}" &
	${NICE} -n ${NICE_PRI} ${MYSQLDUMP} -u ${MYSQL_USER} -p${MYSQL_PASS} ${DBi} > ${MOUNT_POINT}${TMP_PATH}mysql_pipe
	echo "$(date) -> DB: $DBi - Backup done" >> ${LOG_FILE} 
	${RM} -f ${MOUNT_POINT}${TMP_PATH}mysql_pipe
done
}
