
//gamepath
var c = document.getElementById("gamefield");
var ctx = c.getContext("2d");

var image = new Image();
image.onload=start;
image.src="content/rr12x12_Pixel_Block_Solid_Grass_PRINT_FILE_shop_preview.png";
function start(){
    var pattern=ctx.createPattern(image,'repeat');
    ctx.beginPath();
    ctx.arc(375,300,225,0,Math.PI*2);
    ctx.closePath();
    ctx.fillStyle=pattern;
    ctx.fill();
    ctx.stroke();
};

