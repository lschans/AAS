function contsize() {
    var h = window.innerHeight;
    // 115 = footer and header height
    var calculatecontsize = h - 120;
    var innercalculatecontsize = calculatecontsize + 10;
    $('.windowContainer').css({"height":innercalculatecontsize + "px"} );
    $('.menuCol').css({"height":calculatecontsize + "px"} );
    $('.mainCol').css({"height":calculatecontsize + "px"} );
}

$(window).bind("resize",function(){
    contsize();
});