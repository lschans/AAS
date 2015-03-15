function contsize() {
    var h = window.innerHeight;
    // 115 = footer and header height
    var calculatecontsize = h - 120;
    var calculatefullwindowsize = h - 150;
    var calculatescrollcontainer = h - 220;
    var innercalculatecontsize = calculatecontsize + 10;
    $('.windowContainer').css({"height":innercalculatecontsize + "px"} );
    $('.menuCol').css({"height":calculatecontsize + "px"} );
    $('.mainCol').css({"height":calculatecontsize + "px"} );
    $('.fullWindow').css({"height":calculatefullwindowsize + "px"} );
    $('.scrollContainer').css({"height":calculatescrollcontainer + "px"} );
}

$(window).bind("resize",function(){
    contsize();
});