var ImgDiff = (function(){

    var loadCnt = 0;

    var incLoadCnt = function() {
        loadCnt++;
        if(loadCnt >= 2) {
            $("#diffBtn").removeAttr("disabled");
        }
    };

    var decLoadCnt = function() {
        loadCnt--;
        $("#diffBtn").attr("disabled", "disabled");
    };

    var loadImg = function(event, elem) {
        var file = event.originalEvent.dataTransfer.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {

            $("<img>")
                .bind("load", function(){
                    elem
                        .attr("width", this.width)
                        .attr("height", this.height);

                    var cx = elem[0].getContext("2d");
                    cx.drawImage(this, 0, 0);
                })
                .attr("src", reader.result);

            incLoadCnt();
        };
    };

    var setDDElem = function(msgID, canvasID) {
        $(msgID)
            .bind("dragover", function(e) {
                e.preventDefault();            
            })
            .bind('drop', function(e) {
                e.preventDefault();
                
                $(msgID).hide();
                $(canvasID).show();
                loadImg(e, $(canvasID));
            });

        $(canvasID)
            .bind("dragover", function(e) {
                e.preventDefault();            
            })
            .bind('drop', function(e) {
                e.preventDefault();
                
                decLoadCnt();
                loadImg(e, $(canvasID));
            });
        
        $(msgID).show();
        $(canvasID).hide();
    };

    var renderDiffImg = function() {
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
        var len = maxw*maxh;
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
    };

    var init = function() {
        setDDElem($('#lhsMsg'), $('#lhsCanvas'));
        setDDElem($('#rhsMsg'), $('#rhsCanvas'));

        $("#diffBtn")
            .bind("click", function(e) {
                renderDiffImg();
            })
            .attr("disabled", "disabled");
    };

    return {
        init: init
    };
}());

$(function() {
    ImgDiff.init();
});

