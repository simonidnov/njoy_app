export default {
    data () {
        return {
            canvas: null,
            stage: null,
            currentShape: [],
            oldX: 0,
            oldY: 0,
            oldMidX: 0,
            oldMidY: 0,
            touchPos: null,
            pencil: {
                size: 3,
                color: "#000000",
                stylingW: "round",
                stylingH: "round"
            },
            isActive: false,
            isMouseDown: false
        }
    },
    methods: {
        init (canvasid) {
            this.canvas = document.getElementById(canvasid);
            this.stage = new createjs.Stage("drawing");
            this.stage.autoClear = true;
            this.stage.update();
            this.pencil = {
                "color": this.color,
                "size": this.size,
                "stylingW": "round",
                "stylingH": "round"
            };
            this.stage = new createjs.Stage(canvas_id);
            this.stage.autoClear = true;
            this.stage.update();
            this.touchPos = {
                x: 0,
                y: 0
            };
            this.isMouseDown = false;
            this.currentShape = [];
            createjs.Ticker.setFPS(24);
            createjs.Ticker.addEventListener("tick", $.proxy(function () {
                this.update();
            }, this));
        },
        active () {
            this.isActive = true;
        },
        inactive () {
            this.isActive = false;
        },
        set_pencil (params) {
            $.each(_.keys(params), $.proxy(function (index, param) {
                this.pencil[param] = params[param];
            }, this));
        },
        create_events () {
            createjs.Touch.enable(this.stage);
            this.stage.on("stagemousedown", $.proxy(function (evt) {
                if(!this.isActive) return false;
                this.isMouseDown = true;
                var s = new createjs.Shape();
                if ("ontouchstart" in window) {
                    this.oldX = evt.stageX;
                    this.oldY = evt.stageY;
                    this.oldMidX = evt.stageX;
                    this.oldMidY = evt.stageY;
                    this.touchPos = {
                        x: evt.stageX,
                        y: evt.stageY
                    };
                } else {
                    this.oldX = this.stage.mouseX;
                    this.oldY = this.stage.mouseY;
                    this.oldMidX = this.stage.mouseX;
                    this.oldMidY = this.stage.mouseY;
                }
                var g = s.graphics;
                g.setStrokeStyle(this.pencil.size, this.pencil.stylingW, this.pencil.stylingH);
                g.beginStroke(this.pencil.color);
                this.stage.addChild(s);
                this.currentShape[this.currentShape.length] = s;
            }, this));
            this.stage.on("stagemousemove", $.proxy(function (evt) {
                if(!this.isActive) return false;
                this.touchPos = {
                    x: evt.stageX,
                    y: evt.stageY
                };
            }, this));
            this.stage.on("stagemouseup", $.proxy(function (evt) {
                if(!this.isActive) return false;
                this.isMouseDown = false;
            }, this));
        },
        update (){
            if (this.isMouseDown && this.isActive) {
                if (this.touchPos !== null) {
                    var pt = new createjs.Point(this.touchPos.x, this.touchPos.y);
                } else {
                    var pt = new createjs.Point(this.stage.mouseX, this.stage.mouseY);
                }
                var midPoint = new createjs.Point(this.oldX + pt.x >> 1, this.oldY + pt.y >> 1);
                if (typeof this.currentShape[this.currentShape.length - 1] != "undefined") {
                    this.currentShape[this.currentShape.length - 1].graphics.setStrokeStyle(this.pencil.size, this.pencil.stylingW, this.pencil.stylingH);
                    this.currentShape[this.currentShape.length - 1].graphics.moveTo(midPoint.x, midPoint.y);
                    this.currentShape[this.currentShape.length - 1].graphics.curveTo(this.oldX, this.oldY, this.oldMidX, this.oldMidY);
                }
                this.oldX = pt.x;
                this.oldY = pt.y;
        
                this.oldMidX = midPoint.x;
                this.oldMidY = midPoint.y;
                this.stage.update();
                this._removed = [];
            }
        },
        back () {
            console.log('BACK LAST UPDATE');
        },
        clear () {
            console.log('CLEAR ALL DRAWING OBJECTS');
        },
        flat () {
            console.log('FLAT AS BASE64');
        }
    }
}