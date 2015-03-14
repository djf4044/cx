#pragma strict

var sceneController : GameObject;
var guiCanvas : Canvas;
var errorMessageText : GameObject;
var crashMessage : String;
var outOfCoalMessage : String;

var remainingCoalPrefix : String;
var remainingCoalText : GameObject;

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

function setMessage(message : String){
	var msg : GameObject = Instantiate(errorMessageText);
	var text : UnityEngine.UI.Text = msg.GetComponent(UnityEngine.UI.Text) as UnityEngine.UI.Text;
	text.text = message;
	//assing to the canvas object
	msg.transform.SetParent(guiCanvas.transform, false);
}

function crash(){
	setMessage(crashMessage);
}

function outOfCoal(){
	setMessage(outOfCoalMessage);
}

function setRemainingCoal(amt : float){
	var text : UnityEngine.UI.Text = remainingCoalText.GetComponent(UnityEngine.UI.Text) as UnityEngine.UI.Text;
	text.text = remainingCoalPrefix + " " + Mathf.Round(amt);
}