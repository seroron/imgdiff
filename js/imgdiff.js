
var loadImg = function(event, element, callback) {
    var file = event.originalEvent.dataTransfer.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {

        $("<img>")
            .bind("load", function(){
                $(element)
                    .attr("width", this.width)
                    .attr("height", this.height);

                var cx = element.getContext("2d");
                cx.drawImage(this, 0, 0);

                console.debug(this.width);
                console.debug(this.height);
                console.debug(file.name);
            })
            .attr("src", reader.result);
    }

    callback();
}


$(function() {
    
    $('#lhsCanvas')
        .bind("dragover", function(e) {
            e.preventDefault();            
        })
        .bind('drop', function(e) {
            e.preventDefault();
            loadImg(e, this, function() {
            });
        })
        .hide();

    // var cx = $('#lhsCanvas')[0].getContext("2d");
    // cx.textAlign    = "center";
    // cx.textBaseline = "middle";
    // cx.font = "20px 'ＭＳ Ｐゴシック'";
    // cx.fillText("ここに、比較したい画像をドラッグ＆ドロップで配置", 250, 70);
    

    $('#rhsCanvas')
        .bind("dragover", function(e) {
            e.preventDefault();            
        })
        .bind('drop', function(e) {
            e.preventDefault();
            loadImg(e, this, function() {
            });
        })
    .hide();


    $("#diffBtn")
        .bind("click", function(e) {
  
            var lhsCanvas = $('#lhsCanvas')[0];
            var lhsCx     = lhsCanvas.getContext("2d");
            var lw        = lhsCanvas.width;
            var lh        = lhsCanvas.height;
            var lhsData   = lhsCx.getImageData(0, 0, lw, lh).data;

            var rhsCanvas = $('#rhsCanvas')[0];
            var rhsCx     = rhsCanvas.getContext("2d");
            var rw        = rhsCanvas.width;
            var rh        = rhsCanvas.height;
            var rhsData   = rhsCx.getImageData(0, 0, rw, rh).data;

            var maxw = Math.max(lw, rw);
            var maxh = Math.max(lh, rh);

            var resultCanvas = $("#resultCanvas")[0];
            $(resultCanvas)
                .attr("width",  maxw)
                .attr("height", maxh);

            var cx = resultCanvas.getContext("2d");
            var imgData = cx.createImageData(maxw, maxh);
            var data = imgData.data;
            var len = maxw*maxh
            for(var y=0; y<maxh; ++y) {
                for(var x=0; x<maxw; ++x) {
                    if(x<lw && y<lh && x<rw && y<rh) {
                        
                        if(lhsData[(x + y*lw)*4    ] == rhsData[(x + y*rw)*4    ] &&
                           lhsData[(x + y*lw)*4 + 1] == rhsData[(x + y*rw)*4 + 1] &&
                           lhsData[(x + y*lw)*4 + 2] == rhsData[(x + y*rw)*4 + 2] &&
                           lhsData[(x + y*lw)*4 + 3] == rhsData[(x + y*rw)*4 + 3]) {
                     
                            // 一致
                            data[(x + y*maxw)*4]   = 50;
                            data[(x + y*maxw)*4+1] = 255;
                            data[(x + y*maxw)*4+2] = 255;
                            data[(x + y*maxw)*4+3] = 255;
                        } else {
                            // 不一致
                            data[(x + y*maxw)*4]   = 255;
                            data[(x + y*maxw)*4+1] = 100;
                            data[(x + y*maxw)*4+2] = 255;
                            data[(x + y*maxw)*4+3] = 255;
                        }

                    } else if(x<lw && y<lh ||
                              x<rw && y<rh){
                        // どちらか一方のみの画像領域
                        data[(x + y*maxw)*4]   = 255;
                        data[(x + y*maxw)*4+1] = 255;
                        data[(x + y*maxw)*4+2] = 100;
                        data[(x + y*maxw)*4+3] = 255;
                     }
                }
            }

            cx.clearRect(0, 0, maxw, maxh);
            cx.putImageData(imgData, 0, 0);
        });
});
