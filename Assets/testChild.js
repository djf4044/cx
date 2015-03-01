#pragma strict

var track : GameObject;

function Start () {

	var plane = track.transform.GetChild(2);
	Debug.Log(plane.name);
	
	var obj : GameObject = Instantiate(track);
	
	plane = obj.transform.GetChild(2);
	Debug.Log(plane.transform.position.z);
	
	var sttrack = obj.transform.GetChild(0);
	sttrack.transform.parent.transform.position.z += 10;
	
	Debug.Log(plane.transform.position.z);

}

function Update () {

}