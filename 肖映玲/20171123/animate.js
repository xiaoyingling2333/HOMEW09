/* Version 0.1*/
/* Version 1.0   添加透明度改变*/
/* Version 1.1   把回调函数中的this指向elem*/
/**/

/**
 * 包含运动和透明度改变的函数
 * @param elem 要运动的html元素
 * @param targetJSON {JSON} 运动终止时的属性值
 * @param time 单位是毫秒，运动经历的总时间
 * @param callback 回调函数，运动结束后执行的函数
 */
function animate(elem,targetJSON,time,tweenString,callback) {
    // 判断参数情况，根据不同情况为参数赋默认值
    if(arguments.length < 3 ||
        typeof arguments[0] !== 'object' ||
        typeof arguments[1] !== 'object' ||
        typeof arguments[2] !== 'number'){     //   参数少于3个及类型错误的处理
        throw new Error("对不起，您传入的参数类型有误或者个数不足，请重新传参");
        return;
    }else if(arguments.length === 3){ // 恰好传3个参数，则后两个参数的默认情况
        tweenString = 'Linear';
        callback = null;
    }else if(arguments.length === 4){ // 恰好传4个参数，第四个参数根据类型分情况处理
        switch (typeof arguments[3]){
            case 'string':
                callback = null;
                break;
            case 'function':
                tweenString = 'Linear';
                break;
            default:
                throw new Error("对不起，第四个参数只能传字符串或者函数！");
                break;
        }
    }
    // 强制加入判断属性，为函数节流做准备，为true表示可以运动，为false时表示不能运动或运动停止
    elem.isanimated = true;

    // MSIE: MicroSoft Internet Explore
    var interval = (window.navigator.userAgent.indexOf('MSIE') !== -1) ? 50 : 10;


    // 运动执行的总次数 = 总时间 / 一次运动花费的时间（每隔多长时间运动一次）
    var totalFrames = time / interval;

    // 获取初始状态，并保存在startJSON里
    var startJSON = {};// {"top" : 100,"left" : 100}

    // 计算并保存每个属性变化量
    var deltaJSON = {};
//一次遍历，实现初始状态的赋值，结束状态去px，计算变化量
    for(var k in targetJSON){
        startJSON[k] = parseFloat(fetchComputedValue(elem,k));
        targetJSON[k] = parseFloat(targetJSON[k]);
        deltaJSON[k] = targetJSON[k] - startJSON[k];
    }


    // 计数器，用于记录实际运动的次数
    var frameNumber = 0;

    // 存放每一帧的状态;通过调用tween类中的动画方法得来
    var frameState;

    var timer = setInterval(function () {
        // 运动过程： 每一帧都调用tween类中的动画函数获取，当前帧的状态
        for(var n in startJSON){
            // 当前帧的状态
            frameState = Tween[tweenString](frameNumber,startJSON[n],deltaJSON[n],totalFrames);
            
            //把调用的状态用业务代码实现elem的运动
            if(n !== 'opacity'){
                elem.style[n] = frameState + "px";
            }else{
                elem.style[n] = frameState;
                elem.style.filter = "alpha(opacity=" + (frameState * 100) + ")";
            }
        }
        // 运动一次，计数器加 1
        frameNumber++;
        // 判断实际运动的次数是否等于应该运动的总次数，如果是则“拉终停表”
        if(frameNumber === totalFrames){
            // 拉终： 强行改变到终止状态
            for(var y in targetJSON) {
                if(y !== 'opacity'){
                    elem.style[y] = targetJSON[y] + "px";
                }else{
                    elem.style[y] = targetJSON[y];
                    elem.style.filter = "alpha(opacity=" + (targetJSON[y] * 100) + ")";
                }
            }
            // 停表： 清除定时器
            clearInterval(timer);
            // 函数节流，停表后，不再运动所以isanimated改成false
            elem.isanimated = false;

            // 执行回调函数，调用的时候传什么就执行什么
            // 调用call方法让回调函数中的this指向elem
            //因为callback有时会不传，所以要判断
            // if(callback){
            //     callback.call(elem);
            // }
            callback && callback.call(elem);//if的短路简写
        }
    },interval);// 执行一次花费的时间
}

/**
 * 获取某一个元素的某个css样式值
 * @param ele 要获取样式的html元素
 * @param styles 要获取的某一个css属性
 * @returns {*} 该元素该属性的值
 */
function fetchComputedValue(ele,styles) {
    if(getComputedStyle){
//           backgroundColor -> background-color
        styles = styles.replace(/([A-Z])/g,function (match,$1) {
            return "-" + $1.toLowerCase();
        });
        return getComputedStyle(ele)[styles];
    }else{
//            background-color -> backgroundColor
        styles = styles.replace(/\-([a-z])/g,function (match,$1) {
            return $1.toUpperCase();
        });
        return ele.currentStyle[styles];
    }
}



// Tween类 缓冲动画
// 第一个参数t表示当前帧编号
// 第二个参数b表示起始位置
// 第三个参数c表示变化量
// 第四个参数d表示总帧数
var Tween = {
    Linear: function(t,b,c,d){
        return c*t/d + b;
    },
    QuadEaseIn: function(t,b,c,d){
        return c*(t/=d)*t + b;
    },
    QuadEaseOut: function(t,b,c,d){
        return -c *(t/=d)*(t-2) + b;
    },
    QuadEaseInOut: function(t,b,c,d){
        if ((t/=d/2) < 1) return c/2*t*t + b;
        return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    CubicEaseIn: function(t,b,c,d){
        return c*(t/=d)*t*t + b;
    },
    CubicEaseOut: function(t,b,c,d){
        return c*((t=t/d-1)*t*t + 1) + b;
    },
    CubicEaseInOut: function(t,b,c,d){
        if ((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    },
    QuartEaseIn: function(t,b,c,d){
        return c*(t/=d)*t*t*t + b;
    },
    QuartEaseOut: function(t,b,c,d){
        return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    QuartEaseInOut: function(t,b,c,d){
        if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },
    QuintEaseIn: function(t,b,c,d){
        return c*(t/=d)*t*t*t*t + b;
    },
    QuintEaseOut: function(t,b,c,d){
        return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },
    QuintEaseInOut: function(t,b,c,d){
        if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
        return c/2*((t-=2)*t*t*t*t + 2) + b;
    },
    SineEaseIn: function(t,b,c,d){
        return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    },
    SineEaseOut: function(t,b,c,d){
        return c * Math.sin(t/d * (Math.PI/2)) + b;
    },
    SineEaseInOut: function(t,b,c,d){
        return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    },
    ExpoEaseIn: function(t,b,c,d){
        return (t===0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
    },
    ExpoEaseOut: function(t,b,c,d){
        return (t===d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    },
    ExpoEaseInOut: function(t,b,c,d){
        if (t===0) return b;
        if (t===d) return b+c;
        if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
        return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    CircEaseIn: function(t,b,c,d){
        return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
    },
    CircEaseOut: function(t,b,c,d){
        return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
    },
    CircEaseInOut: function(t,b,c,d){
        if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
        return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
    },
    ElasticEaseIn: function(t,b,c,d,a,p){
        if (t===0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },
    ElasticEaseOut: function(t,b,c,d,a,p){
        if (t===0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
    },
    ElasticEaseInOut: function(t,b,c,d,a,p){
        if (t===0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
        if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },
    BackEaseIn: function(t,b,c,d,s){
        if (s == undefined) s = 1.70158;
        return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    BackEaseOut: function(t,b,c,d,s){
        if (s == undefined) s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    BackEaseInOut: function(t,b,c,d,s){
        if (s == undefined) s = 1.70158;
        if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },
    BounceEaseIn: function(t,b,c,d){
        return c - Tween.BounceEaseOut(d-t, 0, c, d) + b;
    },
    BounceEaseOut: function(t,b,c,d){
        if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    },
    BounceEaseInOut: function(t,b,c,d){
        if (t < d/2) return Tween.BounceEaseIn(t*2, 0, c, d) * .5 + b;
        else return Tween.BounceEaseOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
    }
};
