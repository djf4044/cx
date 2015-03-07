#pragma strict

private var startTime : double;
private var lifeTime : double = 120; //sec

function Start () {
	startTime = Time.time;
}

//Main update function for each track piece,
//Cleans up the track after lifetime expires
function Update () {

	var nowTime = Time.time;
	if(nowTime - startTime > lifeTime){
		Destroy(transform.gameObject);
	}
	
}