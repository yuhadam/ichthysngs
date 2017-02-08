/**
 * 
 */

// global parameters
var conf = new Object();

var fileConf = new Object(); //when job create store job configuration
var bundleConf =new Object(); //when bundle upload store bundle configuration
var exeConf=new Object(); //when exe upload store exe configuration
var baseImageConf=new Object();  //when baseImage upload store baseImage configuration, not yet implemented
var scriptConf=new Object();//when script upload store script configuration



var sizeObj = new Object(); //when job create, inputFile's information
var bundleSizeObj = new Object(); //when bundle upload, bundleFile's information
var exeSizeObj = new Object();//when exe upload, exeFile's information

// when baseImage upload
var dockerFileConf=new Object();// store custom baseImage configuration
var scripts = new Object(); // store custom baseImage's script
var envs = new Object(); //store custom baseImage's env

var uploadWin = null; //upload file window


var mCheck=0;// message.scala.html loaded mCheck=1 .. if mCheck==1 list page create addBtn(checkbox), else no addBtn
var jCheck=0;
var bCheck=0;
var eCheck=0;
var iCheck=0;
var sCheck=0;

//In main page , replace content, ajax get from controllers.PageController.getHtml via routes
function contentChange(content){
  $.ajax({
    url:'/views/'+content,
    type:'GET',
    crossOrigin: true,
   // Because all upload pages(jobCreate,bundleUpload,envScriptUpload,exeUpload,baseImageUpload) are independent with list pages(jobList,bundleList....), so when upload page loaded, call list page load function.    
    success: function(data) {    	
    	// '#bundlePage','#exePage','#scriptPage' is elements in uploadPage.scala.html
    	if(content=="bundleUpload"){
    		mCheck=0;
    		// If bundleUpload.scala.html loaded to '#bundlePage', load bundleList.scala.html in '#bundle-list-table' element (in bundleList.scala.html)
    		$("#bundlePage").html(data); 
    		// bundleList function located /public/js/bundleUpload.js  (this js already declare in main.scala.html)
    		bundleList();
    	}
    	else if(content=="exeUpload"){
    		mCheck=0;
    		// If exeUpload.scala.html loaded to '#exePage', load exeList.scala.html in '#exe-list-table' element (in exeList.scala.html)
    		$("#exePage").html(data);
    		// exeList function located /public/js/exeUpload.js  (this js already declare in main.scala.html)
    		exeList();
    	}    
    	else if(content=="scriptUpload"){
    		mCheck=0;
    		// If envScriptUpload.scala.html loaded to '#scriptPage', load envScriptList.scala.html in '#script-list-table' element (in envSCriptList.scala.html)
    		$("#scriptPage").html(data);
    		// envScriptList function located /public/js/envScriptUpload.js  (this js already declare in main.scala.html)
    		envScriptList();
    	}
    	////
    	
    	else{
    		$("#content").html(data);
    		// If jobCreate.scala.html loaded, load jobList.html in '#list' element (in jobCreate.scala.html) 
    		if(content=="jobCreate"){
    			// jobList function located /public/js/jobCreate.js  (this js already declare in main.scala.html)
    	    	  jobList();
    	      }
    	}  	
    }
 });
}

//websocketvar websocket=null;
var uri=""
function wsConnect() {
  websocketcallback("ws://"+uri+":9001/websocket");  
}
function websocketcallback(wsUri) {
  
  websocket = new WebSocket(wsUri);
  websocket.onopen = function(evt) { onOpen(evt) };
  websocket.onclose = function(evt) { onClose(evt) };
  websocket.onmessage = function(evt) { onMessage(evt) };
  websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt) {
  doSend(conf.uId);
}

function onClose(evt) {

}

// receive websocket from server, and then check job status, replace job List
// status: FileUploading, FileUploadFail => no script, no log, no accordian 
//		   Running, Pending =>  script, no log, no accordian
//		   Success, Fail => script, log, accordian
function onMessage(evt)
{
  var wsJson = JSON.parse(evt.data);
  var data= wsJson.data;
  var image;
  if(wsJson.status=="FileUploading"){
    image="label label-fileupload";    
  }
  else if (wsJson.status=="FileUploadFail"){
    image="label label-fileuploadfail";
  }
  else if (wsJson.status=="Running"){
    image="label label-running";    
    if(data!="null"){
    	$("#acc"+wsJson.jobName+" #script").html(data);
    }
  }
  else if (wsJson.status=="Pending"){
    image="label label-pending";
    if(data!="null"){
    	$("#acc"+wsJson.jobName+" #script").html(data);
    }
  }
  else if (wsJson.status=="Fail"){
    image="label label-fail"
    	if(data!="null"){
    		$("tr[name='"+wsJson.jobName+"']").attr("data-target","#acc"+wsJson.jobName);  //set accordian target
        	$("#acc"+wsJson.jobName+" #log").html(data);
    	}
  }
  else if (wsJson.status=="Success"){
    image="label label-success"
    	if(data!="null"){
    		$("tr[name='"+wsJson.jobName+"']").attr("data-target","#acc"+wsJson.jobName);  //set accordian target
        	$("#acc"+wsJson.jobName+" #log").html(data);
    	}
  }
  else{ 
      image=""
  }
  $("tr[name='"+wsJson.jobName+"'] #status").html("<span class='"+image+"'>"+wsJson.status+"</span>");  
}

function onError(evt) {
}

function doSend(message) {
  websocket.send(message);
}


$(document).ready(function(){
  //When main.scala.html loaded, retrieve default db value (ip...), ajax get from controllers.LaunchController.getDefault via routes
  $.ajax({
    url:'/getDefault',
    type:'GET',
    crossOrigin: true,   
    success: function(data) {
      conf.uri=data;
      uri=data;
      wsConnect();
    }
  });
  
  conf.type="File Upload"
  conf.uId=$("#uId").val();
    
  contentChange("jobCreate"); // First '#content' is jobCreate check contentChange() funciton
  
  if(window.closed){
	  alert("closed");
	  uploadWin=null;
  }
});