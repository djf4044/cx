#pragma strict

var startingCoalAmt : float;
var sceneController : GameObject;
var coalPerSpeedUsage : float;

private var speed : float = 5.0; //Ideally this is set dynamically

private var remainingCoal : float;
private var sc : controller;

private var lastTime : float;

private var stopped : boolean = false;

function Start () {
	sc = sceneController.GetComponent(controller) as controller;
	remainingCoal = startingCoalAmt;
	
	lastTime = Time.time;
}

function Update () {
	if (!stopped){
		var deltaTime = Time.time - lastTime;
		useCoal(deltaTime * coalPerSpeedUsage * speed);

		lastTime = Time.time;
	}
}

function useCoal(amt : float){

 remainingCoal -= amt;
 sc.setRemainingCoal(remainingCoal);
 
 if(remainingCoal < 0){
 	stopped = true;
 }

}
