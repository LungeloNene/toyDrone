var stage;
var surface;
var canvas;
var drone;
var droneGraphic;
var surfaceGraphic;
var projectile;
var projectileGraphic;
var explosionAnimation;
var preload;
var droneCanMove = true;
var droneCanFire = true;
var droneCanRotate = true;
var gameStateStarted = false;
var exploded = false
const DRONE_WIDTH = 2.5;
const DRONE_HEIGHT = 2.5;
const PROJECTILE_WIDTH = 0.5;
const PROJECTILE_HEIGHT = 1;
const PROJECTILE_SPEED = 1;
const DAMAGE_WIDTH = 50;
const DAMAGE_HEIGHT = 50;
const PROJECTILE_TRAVEL_DISTANCE = 2;
const PIXEL_RATIO = 20;

window.onload = function () {
    canvas = document.getElementById("canvas");
    stage = new createjs.Stage(canvas);
    surface = {
        x: 3,
        y: 5,
        width: 10,
        height: 10,
    }
    startScreen();

}

const startScreen = () => {
    var playText = new createjs.Text("Press PLACE to start", "15px Open Sans", "White");
    playText.x = stage.canvas.width / 2 - 75
    playText.y = stage.canvas.height / 2 - 5;
    playText.alpha = 0;
    playText.textBaseline = "alphabetic";
    createjs.Tween.get(playText, { loop: true }).to({ alpha: 1 }, 2000);
    createjs.Ticker.addEventListener("tick", stageUpdate);
    stage.addChild(playText);
    console.log('playText', playText)
    stageUpdate()
}
const stageUpdate = () => {
    stage.update();
}


const showForm = () => {
    var form = document.getElementById('placeForm')
    form.style.display = 'block'
}
const hideForm = () => {
    var form = document.getElementById('placeForm')
    form.style.display = 'none'
}

const okClickHandler = () => {
    setupGame()
    hideForm()

}

const setupGame = () => {
    var x = parseInt(document.getElementById("xInput").value);
    var y = parseInt(document.getElementById("yInput").value);
    var direction = document.getElementById("directionOptions").selectedIndex * 90;

    if (x > 8) { x = 8; }
    if (y > 8) { y = 8; }

    if (x < 0) { x = 0; }
    if (y < 0) { y = 0; }
    x += surface.x + (DRONE_WIDTH / 2);
    y = (surface.y + surface.height - (DRONE_HEIGHT / 2)) - y;
    startGame(x, y, direction)
}

const startGame = (x, y, direction) => {
    stage.removeAllChildren();
    if (!gameStateStarted) {
        createjs.Ticker.removeEventListener("tick", stageUpdate);
        gameStateStarted = true;
    }
    drone = {
        x, y, direction,
        width: DRONE_WIDTH,
        height: DRONE_HEIGHT
    }
    renderComponents()
    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.setInterval(25);
    createjs.Ticker.setFPS(60);
}
const renderComponents = () => {

    renderSurface()
    renderDrone()
    setupExplosionSprite()
}

const tick = () => {
    moveProjectile();
    stage.update();
}

const renderSurface = () => {
    surfaceGraphic = new createjs.Bitmap('img/bg.png');
    surfaceGraphic.x = surface.x * PIXEL_RATIO;
    surfaceGraphic.y = surface.y * PIXEL_RATIO;
    stage.addChild(surfaceGraphic);
    stage.update();
    console.log('surface', surfaceGraphic)
}

const renderDrone = () => {
    droneGraphic = new createjs.Bitmap('img/drone_da4d57.png');
    droneGraphic.regX = (drone.width * PIXEL_RATIO) / 2;
    droneGraphic.regY = (drone.height * PIXEL_RATIO) / 2;
    droneGraphic.x = drone.x * PIXEL_RATIO;
    droneGraphic.y = drone.y * PIXEL_RATIO;
    droneGraphic.rotation = drone.direction;
    stage.addChild(droneGraphic);
    stage.update();
    console.log('droneGraphic', droneGraphic)
}

const move = () => {
    if (gameStateStarted){
        if (droneCanMove){
            droneCanMove = false;
            moveDrone()
            createjs.Tween.get(droneGraphic).to({x:drone.x* PIXEL_RATIO, y: drone.y* PIXEL_RATIO}, 500)
            .call(()=>{droneCanMove = true;});  

        }
    }
}
const moveDrone = ()=>{
    var temp;
    switch (drone.direction) {
        case 0:
            temp = drone.y - (drone.height / 2)
            if (temp > surface.y) {
                if (temp - 1 < surface.y) { drone.y = drone.y + (surface.y - temp) }
                else { drone.y = drone.y - 1 }
            }
            break;

        case 180:
            temp = drone.y + (drone.height / 2)
            if (temp < surface.y + surface.height) {
                if (temp + 1 > surface.y + surface.height) {
                    drone.y = drone.y + (surface.y + surface.height) - temp;
                }
                else { drone.y = drone.y + 1; }
            }
            break;

        case 90:
            temp = drone.x + (drone.height / 2);
            if (temp < surface.x + surface.width) {
                if (temp + 1 > surface.x + surface.width) {
                    drone.x = drone.x + (surface.x + surface.width) - temp
                }
                else {
                    drone.x = drone.x + 1
                }
            }
            break;

        case 270:
            temp = drone.x - (drone.height / 2);
            if (temp > surface.x) {
                if (temp - 1 < surface.x) {
                    drone.x = drone.x - (temp - surface.x)
                }
                else {
                    drone.x = drone.x - 1
                }
            }
            break;
    }
}

const left =()=>{
    if (gameStateStarted){
      if (droneCanRotate){
        droneCanRotate = false;
        droneCanFire = false;
        drone.direction = drone.direction - 90;
        createjs.Tween.get(droneGraphic).to({rotation:drone.direction}, 500)
        .call(()=>{
            droneCanFire = true;
            droneCanRotate = true;
            if (drone.direction <= -90){
              drone.direction = 270
              droneGraphic.rotation = 270;
            }         

        });  
        stage.update();

      }
    }
}

const right = ()=>{
    if (gameStateStarted){
      if (droneCanRotate){
        droneCanRotate = false;
        droneCanFire = false;
        drone.direction = drone.direction + 90;
        createjs.Tween.get(droneGraphic).to({rotation:drone.direction}, 500)
        .call(()=>{
            droneCanFire = true;
            droneCanRotate = true;
            if (drone.direction >= 360){
              drone.direction = 0
              droneGraphic.rotation = 0;
            }         

        });  
        stage.update();
      }
    }
  }


  const  attack = ()=>{
    if (gameStateStarted){
      if (droneCanFire){
        if (canDroneFireProjectile()){
          if ( (projectile == null) || (projectile.hasProjectileExploded()) ){
            projectile = new Projectile(0, 0, PROJECTILE_WIDTH, PROJECTILE_HEIGHT, PROJECTILE_SPEED, PROJECTILE_TRAVEL_DISTANCE, 0);
            projectile.setProjectileStartPosition(drone.x, drone.y, drone.width, drone.height, drone.direction);
            renderProjectile();
          }
        }
        
        else{
          alert("Close to boundary - Cannot fire projectile")
        }
      }
    }
  }


const canDroneFireProjectile = ()=>{
    var projectileTravelDistance = 2
    var projectileHeight = 1
    var projectileStartPosition;
    switch(drone.direction){
      case 0:
        projectileStartPosition = drone.y - (drone.height / 2);
        return !(projectileStartPosition - projectileTravelDistance - projectileHeight < surface.y )

      case 90:
        projectileStartPosition = drone.x + drone.width / 2;
        return !(projectileStartPosition + projectileTravelDistance + projectileHeight > surface.x + surface.width)

      case 180:
        projectileStartPosition = drone.y + drone.height / 2;
        return !(projectileStartPosition + projectileTravelDistance + projectileHeight > surface.y + surface.height);
    
        
      case 270:
        projectileStartPosition = drone.x - drone.height/ 2;
        return !(projectileStartPosition - projectileTravelDistance - projectileHeight < surface.x )
    }
  }
  const renderProjectile =()=>{  
    projectileGraphic = new createjs.Bitmap("img/rocket_h6dp61.png");
    projectileGraphic.rotation = drone.direction;
    projectileGraphic.x = projectile.getXPosition() * PIXEL_RATIO;
    projectileGraphic.y = projectile.getYPosition() * PIXEL_RATIO;
    stage.addChild(projectileGraphic);  
    stage.update(); 
  }

  const moveProjectile = ()=>{
    if (projectile != null){
        projectile.moveProjectile(drone.direction);
        projectileGraphic.x = projectile.getXPosition() * PIXEL_RATIO;
        projectileGraphic.y = projectile.getYPosition() * PIXEL_RATIO;
        projectileGraphic.rotation += projectile.getRotation();
        if (projectile.getTravelDistance() == 0){
          projectile.setTravelDistance(-1);
          setTimeout(()=>{explosion()}, 100);
        }
      }
  }

  const explosion =()=>{
    explosionAnimation.x = projectile.getXPosition() * PIXEL_RATIO;
    explosionAnimation.y = projectile.getYPosition() * PIXEL_RATIO;
    stage.addChild(explosionAnimation);
    
    setTimeout(()=>{
        stage.removeChild(explosionAnimation);
        stage.removeChild(projectileGraphic);
        damage();
        projectile.explodeProjectile();
    }, 200);
  }

  const damage = ()=>{
    var damageGraphic = new createjs.Bitmap('img/damage2_dj3206.png');
    damageGraphic.x = (projectile.getXPosition() * PIXEL_RATIO) - DAMAGE_WIDTH / 2;
    damageGraphic.y = (projectile.getYPosition() * PIXEL_RATIO) - DAMAGE_HEIGHT / 2;
    stage.addChild(damageGraphic);  
    stage.removeChild(droneGraphic);
    stage.addChild(droneGraphic);
    stage.update(); 
  }

  const setupExplosionSprite = ()=>{
    var data = {
      framerate: 10,
      images: ['img/explosion_aps9rp.png'],
      frames: {width:64, height:64, regX:32, regY:32},
      animations: {
        'explode': [0, 23],
      }
    }
  
    var spritesheet = new createjs.SpriteSheet(data);
    explosionAnimation = new createjs.Sprite(spritesheet, 'explode');
  }

  const report = ()=>{
    if (gameStateStarted){
      var x = drone.x- (drone.width / 2) - surface.x;
      var y = (surface.y + surface.height)  - drone.y- (drone.height / 2);
      var direction;
  
      switch(drone.direction){
        case 0: 
          direction = "North";
          break;
  
        case 90: 
          direction = "East";
          break;
  
        case 180: 
          direction = "South";
          break;
  
        case 270: 
          direction = "West";
          break;
      }
  
      var output = "X: "+ x + "\nY:"+ y + "\nDirection: "+direction;
      alert(output);
    }
  }
  


  class Projectile{
    constructor(xPosition, yPosition, width, height, speed, travelDistance, rotation){
      var _xPosition = xPosition;
      this.setXPosition = function(xPosition) { _xPosition = xPosition; }
      this.getXPosition = function() { return _xPosition; }
      
      var _yPosition = yPosition;
      this.setYPosition = function(yPosition) { _yPosition = yPosition; }
      this.getYPosition = function() { return _yPosition; }
          
      var _width = width;
      this.setWidth = function(width) { _width = width; }
      this.getWidth = function() { return _width; }
      
      var _height = height;
      this.setHeight = function(height) {_height = height; }
      this.getHeight = function() {return _height; }
      
      var _speed = speed;
      this.setSpeed = function(speed) {_speed = speed; }
      this.getSpeed = function() {return _height; }
      
      var _travelDistance = travelDistance;
      this.setTravelDistance = function(travelDistance) {_travelDistance = travelDistance; }
      this.getTravelDistance = function() {return _travelDistance; }
      
      var _exploded = false;
      this.explodeProjectile = function() {_exploded = true; }
      this.hasProjectileExploded = function() {return _exploded; }
      
      var _rotation = rotation;
      this.setRotation = function(rotation) { _rotation = rotation; }
      this.getRotation = function() { return _rotation; }
    }
    
    setProjectileStartPosition(droneX, droneY, droneWidth, droneHeight, droneOrientation){
      switch(droneOrientation){
        case 0:
          this.setXPosition(droneX - this.getWidth() / 2);
          this.setYPosition(droneY - this.getHeight());
          break;
          
        case 90:
          let tempHeight = this.getHeight();
          this.setHeight(this.getWidth());
          this.setWidth(tempHeight);
          this.setXPosition(droneX + this.getWidth());
          this.setYPosition(droneY - this.getHeight() / 2);
          break;
          
        case 180:
          this.setXPosition(droneX + this.getWidth() / 2);
          this.setYPosition(droneY + this.getHeight());
          break;
          
        case 270:
          let tempHeight2 = this.getHeight();
          this.setHeight(this.getWidth());
          this.setWidth(tempHeight2);
          this.setXPosition(droneX - this.getWidth());
          this.setYPosition(droneY + this.getHeight() / 2);
          break;
      }
    }
    
    moveProjectile(droneOrientation){
      if (this.getTravelDistance() > 0){
        switch(droneOrientation){
          case 0:
            this.setYPosition(this.getYPosition() - 1);
            this.setTravelDistance(this.getTravelDistance() - 1);
            this.setRotation(this.getRotation() - 5);
            break;
            
          case 90:
            this.setXPosition(this.getXPosition() + 1);
            this.setTravelDistance(this.getTravelDistance() - 1);
            this.setRotation(this.getRotation() + 5);
            break;
            
          case 180:
            this.setYPosition(this.getYPosition() + 1);
            this.setTravelDistance(this.getTravelDistance() - 1);
            this.setRotation(this.getRotation() + 5);
            break;
            
          case 270:
            this.setXPosition(this.getXPosition() - 1);
            this.setTravelDistance(this.getTravelDistance() - 1);
            this.setRotation(this.getRotation() - 5);
            break;
        }
      }
    }
  }