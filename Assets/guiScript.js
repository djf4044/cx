#pragma strict

var sceneController : GameObject;
var guiCanvas : Canvas;
var crashMessage : GameObject;

private var sc : controller;

function Start () {
	sc = sceneController.GetComponent(controller) as controller;
}

function Update () {

}

function OnGUI() {
	
}

function straightClicked(){
	sc.queueStraight();
}

function rightClicked(){
	sc.queueRight();
}

function leftClicked(){
	sc.queueLeft();
}

function crash(){
	var msg : GameObject = Instantiate(crashMessage);
	msg.transform.SetParent(guiCanvas.transform, false);
}