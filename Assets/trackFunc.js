#pragma strict

private var startTime : double;
private var lifeTime : double = 120; //sec

function Start () {
	startTime = Time.time;
}

function Update () {

	//var dist = Vector3.Distance(transform.position, Camera.main.transform.position);
	//Debug.Log("Dist: " + dist);
	//if( dist < 2 ){

	var nowTime = Time.time;
	if(nowTime - startTime > lifeTime){
		Destroy(transform.gameObject);
	}
	//}
}