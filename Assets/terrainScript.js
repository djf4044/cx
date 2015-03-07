#pragma strict

var terrain : Terrain;
var imageTA : TextAsset;

private var terrainDat : TerrainData;
private var xNumSamps : int;
private var xSampWidth : int;
private var zNumSamps : int;
private var zSampWidth : int;
private var heights : float[,]; //height array, index as z,x
private var tSize : Vector3; //total size in world units

private final var X_SIZE : float = 512;
private final var Z_SIZE : float = X_SIZE;

function Start () {

	//load heightmap
	var tex = new Texture2D(X_SIZE, Z_SIZE);
	tex.LoadImage(imageTA.bytes);
	
	terrainDat = terrain.terrainData;
	xNumSamps = terrainDat.heightmapWidth; //x size of heightmap
	zNumSamps = terrainDat.heightmapHeight;
	tSize = terrainDat.size; //world size
	//Debug.Log("terrainSize=" + tSize);
	
	xSampWidth = terrainDat.heightmapScale.x;
	zSampWidth = terrainDat.heightmapScale.z;
	
	heights = terrainDat.GetHeights(0,0,xNumSamps,zNumSamps);
	//Debug.Log("xNumSamps=" + xNumSamps);
	//Debug.Log("zNumSamps=" + zNumSamps);

	for(var x = 0; x < X_SIZE; x++){
		for(var z = 0; z < Z_SIZE; z++){
			//for some reason saving the png in GIMP then reading it
			//here will swap the values
			heights[z,x] = tex.GetPixel(x, z).grayscale;
		}
	}
	
	
}

function Update () {

}



function zeroHeight(worldXMin : int, worldXMax : int, worldZMin : int, worldZMax : int){

	if(heights == null){
		return;
	}
	//get point local to terrain
	var min : Vector3 = new Vector3(worldXMin, 0, worldZMin);
	min = terrain.transform.InverseTransformPoint(min);

	var max : Vector3 = new Vector3(worldXMax, 0, worldZMax);
	max = terrain.transform.InverseTransformPoint(max);

	Debug.Log("xMin-in" + min.x);
	Debug.Log("xMax-in" + max.x);
	Debug.Log("zMin-in" + min.z);
	Debug.Log("zMax-in" + max.z);

	//determine which samples are affected
	var xMinAct : int = min.x * xNumSamps / tSize.x;
	xMinAct = Mathf.Clamp(xMinAct, 0, xNumSamps);
	var xMaxAct : int = max.x * xNumSamps / tSize.x;
	xMaxAct = Mathf.Clamp(xMaxAct, 0, xNumSamps);
	
	var zMinAct : int = min.z * zNumSamps / tSize.z;
	zMinAct = Mathf.Clamp(zMinAct, 0, zNumSamps);
	var zMaxAct : int = max.z * zNumSamps / tSize.z;
	zMaxAct = Mathf.Clamp(zMaxAct, 0, zNumSamps);

	Debug.Log("Zeroing x["+xMinAct+"-"+xMaxAct+"], z["+zMinAct+"-"+zMaxAct+"]");

	for(var x = xMinAct; x < xMaxAct; x++){
		for(var z = zMinAct; z < zMaxAct; z++){
			heights[z,x]=0;
		}
	}
	terrainDat.SetHeights(0,0,heights);
		
}

