window.addEventListener("load", function (){
    const canvas=document.getElementById("canvas1");
    const ctx=canvas.getContext('2d');
    canvas.width=800;
    canvas.height=720;
})


// apply eventlistners to keyboad events & hold array of currently active keys
class InputHandler{
    constructor() {
        this.keys=[];
        window.addEventListener('keydown',e=>{
            // check array down and the key is already in the array or not
            if (e.key=="ArrowDown" && this.keys.indexOf(e.key)==-1){
                this.keys.push(e.key);
            }
            console.log(e.key,this.keys);

        });
    }
}

const input=new InputHandler();

// draw update players according to key reactions
class Player{}

// handle endless scrolling backgrounds
class Background{}

class Enemy {

}

// add remove animate enemies
class handleEnemies{}

// display score,messages
function displayStatusText(){

}

function animate(){

}