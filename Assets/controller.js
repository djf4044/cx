#pragma strict

var ohLight : GameObject;
var stParent : GameObject; //position the parent to position the track
var lbParent : GameObject;
var rbParent : GameObject;
var guiControllerScript : GameObject;
var terrainControllerScript : GameObject;

//prefab refs
private var stTrack : GameObject;
private var lbTrack : GameObject;
private var rbTrack : GameObject;

//controllers for other scripts
private var guiController : guiScript;
private var terrainController : terrainScript;

private final var pieceIdx : int = 0;
private final var frontIdx : int = 1;
private final var backIdx : int = 2;

private final var straight : int = 0;
private final var left : int = 1;
private final var right : int = 2;

private var stTrackLen : float;

private var lastPiece : GameObject;

private var lastTime : float;

private var isCrashed : boolean = false;

//for the camera
private var lastStartPt : Transform;
private var lastStartTime : float;
private var lastEndPt : Transform;
private var lastRot : Quaternion;
private var targetRot: Quaternion;
private var camSpeed : float = 8.0;
private var camHeight : float = 3.0;
private var ptQueue : Queue;

//event queues
private var pieceQueue : Queue;



function Start () {
//	Debug.Log("Starting");
	guiController = guiControllerScript.GetComponent(guiScript) as guiScript;
	terrainController = terrainControllerScript.GetComponent(terrainScript) as terrainScript;

	ptQueue = new Queue();
	pieceQueue = new Queue();

	stTrack = stParent.transform.GetChild(pieceIdx).gameObject;
	lbTrack = lbParent.transform.GetChild(pieceIdx).gameObject;
	rbTrack = rbParent.transform.GetChild(pieceIdx).gameObject;

	stTrackLen = Mathf.Abs(stTrack.renderer.bounds.max.z - stTrack.renderer.bounds.min.z);

	//start with three straight pieces
	pieceQueue.Enqueue(straight);
	pieceQueue.Enqueue(straight);
	pieceQueue.Enqueue(straight);

	var obj : GameObject = genTrack(straight, stParent, false);
	lastPiece = obj;


	//camera's first target is the start of the first track
	lastEndPt = ptQueue.Dequeue();	
	
	lastTime = Time.time;
	
	var tmp = new GameObject().transform;
	tmp.position = Camera.main.transform.position;
	tmp.rotation = Camera.main.transform.rotation;
	lastStartPt = tmp;
	lastStartTime = Time.time;
	targetRot = Quaternion.LookRotation(lastEndPt.position -lastStartPt.position);
	Camera.main.transform.rotation = targetRot;
	lastRot = targetRot;

}

//generates tracks for each piece on the piece queue
function updateTrack(){

	while(pieceQueue.Count > 0){
		var nextPiece = pieceQueue.Dequeue();
		var obj = genTrack(nextPiece, lastPiece, true);
		lastPiece = obj;
	}

}

//move the camera to follow the track
//this path is defined by the points in the point queue (ptQueue)
function updateCamera(){

	var deltaTime = Time.time - lastStartTime;
	var distMoved = deltaTime * camSpeed;
	var vecLen = Vector3.Distance(lastStartPt.position, lastEndPt.position);
	var dt = distMoved / vecLen;

	if(dt >= 1){
		//set new points
		Destroy(lastStartPt.gameObject);
		lastStartPt = lastEndPt;
		if(ptQueue.Count <= 0){
			crash();
			return;
		}
		lastEndPt = ptQueue.Dequeue();
		lastStartTime = Time.time;
		lastRot = Camera.main.transform.rotation;
		if(Vector3.Distance(lastEndPt.position, lastStartPt.position) > 0.01){
			targetRot = Quaternion.LookRotation(lastEndPt.position -lastStartPt.position);
		}
		dt = 0;
	}
	
	Camera.main.transform.position = Vector3.Lerp(lastStartPt.position, lastEndPt.position, dt);
	Camera.main.transform.rotation = Quaternion.Slerp(lastRot, targetRot, dt);
	//Debug.Log(Camera.main.transform.rotation);
						
	ohLight.transform.position = Camera.main.transform.position;
	ohLight.transform.position.y += 5;
	ohLight.transform.position.z += 10;
	
	lastTime = Time.time;
}

//main update function
function Update () {
	
	if(!isCrashed){
		updateTrack();	
		updateCamera();
	}

}

//create a new track piece and animate it (if playAnim = true)
//This will automatically place the start of the new track at the end of lastTrack
//This will also add on a path for the camera to travel over this piece
function genTrack(trackType : int, lastTrack : GameObject, playAnim : boolean) : GameObject{
	var newTrack : GameObject;
	switch(trackType){
		case 0:
			//Debug.Log("New Straight Piece");
	  		newTrack = Instantiate(stParent);
	  	break;
	  
	  	case 1:
	  		//Debug.Log("New Left Bend Piece");
	  		newTrack = Instantiate(lbParent);
	  	break;
	  	
	  	case 2:
	  		//Debug.Log("New Right Bend Piece");
	  		newTrack = Instantiate(rbParent, Vector3.zero, rbParent.transform.rotation);
	  	break;
  	}
	
	//match angles between front of new and back of old planes
	var oldFrontMesh : MeshFilter = lastTrack.transform.GetChild(frontIdx).GetComponent(MeshFilter) as MeshFilter;

	var newBackMesh : MeshFilter = newTrack.transform.GetChild(backIdx).GetComponent(MeshFilter) as MeshFilter;
	
	var eulerOld = oldFrontMesh.transform.rotation.eulerAngles;
	//Debug.Log("eulerOld = " + eulerOld);
	newTrack.transform.rotation *= Quaternion.Euler(0, eulerOld.y, 0);
		
	//oldFront and newBack should now be parallel...move them together
	var oldFrontPos : Vector3 = lastTrack.transform.GetChild(frontIdx).transform.position;	
	
	var newBackPos : Vector3 = newTrack.transform.GetChild(backIdx).transform.position;
		
	var shiftAmt : Vector3 = oldFrontPos - newBackPos;

	//FIXME The curve -> straight still does not line up perfectly, may need model adjustments?
	newTrack.transform.position += shiftAmt;


	if(playAnim){
		newTrack.transform.GetChild(0).gameObject.animation.Play();
	}
	
	genCamPath(newTrack);
	
	adjustTerrain(newTrack);
	
	return newTrack;
}

//Figure out the next few points for the camera location and rotation, assuming the camera 
//is following the track piece
function genCamPath(obj : GameObject) {
	//points must be enqueue back->mid->front
	//Do not modify the original transform or it will move the object on screen
	
	var backMesh : MeshFilter = obj.transform.GetChild(backIdx).GetComponent(MeshFilter) as MeshFilter;
	var pt1 : Transform = new GameObject().transform;
	pt1.position = backMesh.transform.position;
	pt1.position.y += camHeight;
	pt1.rotation = backMesh.transform.rotation;

	//var t = obj.transform.GetChild(pieceIdx).gameObject.transform;
	var t = obj.transform;
	var pt2 = new GameObject().transform;
	pt2.position = t.position;
	pt2.position.y += camHeight;
	pt2.rotation = t.rotation;

	var frontMesh : MeshFilter = obj.transform.GetChild(frontIdx).GetComponent(MeshFilter) as MeshFilter;
	var pt3 = new GameObject().transform;
	pt3.position = frontMesh.transform.position;
	pt3.position.y += camHeight;
	pt3.rotation = frontMesh.transform.rotation;

	var pre : Transform;
	if (ptQueue.Count == 0){
		pre = pt1;
	}else{
		pre = ptQueue.Peek();
	}

	var a1 : Transform = calcVec(pre, pt1, pt2, pt3);
	var a2 : Transform = calcVec(pt1, pt2, pt3, pt3); //a better prediction for the last point may help
	
	ptQueue.Enqueue(pt1);
	ptQueue.Enqueue(a1);
//	ptQueue.Enqueue(pt2); //This point sucks to render, but is needed to calc a1 and a2
	Destroy(pt2.gameObject);
	ptQueue.Enqueue(a2);
	ptQueue.Enqueue(pt3);

}

//set terrain values around the given object (to zero)
function adjustTerrain(obj : GameObject){
	var x = obj.transform.position.x;
	var z = obj.transform.position.z;
	terrainController.zeroHeight(x - 10, x + 10, z - 20, z + 20);
}

//Calculate the vector midway between b and c, using a and d as exterior points (before
//and after b and c, respectively)
function calcVec (a : Transform, b : Transform, c : Transform, d : Transform) : Transform{

	var ang : Vector3 = cubicInt3D(a.eulerAngles, b.eulerAngles, c.eulerAngles, d.eulerAngles, 0.5);
	var pos : Vector3 = Vector3.Lerp(b.position, c.position, 0.5);

	var result : Transform = new GameObject().transform;
	result.position = pos;
	result.eulerAngles = ang;
	return result;
}

//Cubic interpolation in 1D
function cubicInt1D(a : double, b : double, c : double, d : double, mu : double) : double{
	var mu2 = mu * mu;
	var a0 = -0.5*a + 1.5*b - 1.5*c + 0.5*d;
	var a1 = a - 2.5*b + 2*c - 0.5*d;
	var a2 = -0.5*a + 0.5*c;
	var a3 = b;

		return (a0 * mu * mu2 + a1 * mu2 + a2 * mu + a3);
}

//Cubic interpolation in 3 dimensions
//a0 is prev, a1 is start, b1 is finish, b2 is future
function cubicInt3D (a0 : Vector3, a1 : Vector3, b1 : Vector3, b2 : Vector3, dt : double) : Vector3 {

	var x = cubicInt1D(a0.x, a1.x, b1.x, b2.x, dt);
	var y = cubicInt1D(a0.y, a1.y, b1.y, b2.y, dt);
	var z = cubicInt1D(a0.z, a1.z, b1.z, b2.z, dt);

	return new Vector3(x,y,z);
}

function queueStraight(){
	pieceQueue.Enqueue(straight);
} 

function queueLeft(){
	pieceQueue.Enqueue(left);
} 

function queueRight(){
	pieceQueue.Enqueue(right);
} 

function crash(){
	isCrashed = true;
	guiController.crash();
}








