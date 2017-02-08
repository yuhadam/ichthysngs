/**
 * 
 */
// When bootstrap dialog load message.scala.html, bind some function about elements , upload job
$(document).ready(function(){
  var pair =0;
  
  mCheck=1 // mCheck is flag that message.scala.html loaded 

// mode Default is single, not pair => hide  
  $("#file2").hide()
  $("#inputdata2").hide()
  $("#inputdata2i").hide()

// mode changed pair or single => show or hide
  $("#mode").change(function(){
     if($("#mode").val()=="Pair"){
       pair=1;
       $("#file2").show()
       $("#inputdata2").show()
       $("#inputdata2i").show()
     }
     else{
       pair=0;
       $("#file2").hide()
       $("#inputdata2").hide()
       $("#inputdata2i").hide()
     }
  });
  
// Set bootstarp tab contents (baseImageList, scriptList, bundleList, exeList) to create user custom baseImage START /////////
  //load baseImageList.scala.html..   load page from controllers.LaunchController.getHtml via routes 
  $("#baseImagePage").load("/views/baseImageList",function(){
	  //after baseImageList.scala.html, bind click event to '#addBtn' element to select baseImage
	  $("#baseImagePage #baseimage-list-table").on("change","#addBtn",function(){
		  $('input[name="' + this.name + '"]').not(this).prop('checked', false)
		  $('input[name="' + this.name + '"]').not(this).siblings().css('background-color', '#999999');		  
		  $(this).siblings().css('background-color', '#468847');		  
		  dockerFileConf.from=$(this).parent().parent().attr("name")		  
	 })
  });
  // load scriptList.scala.html..   load page from controllers.LaunchController.getHtml via routes
  $("#scriptPage").load("/views/envScriptList",function(){
	  $("#scriptPage #script-list-table").on("change","#addBtn",function(){
		//after scriptList.scala.html, bind click event to addBtn to select script
		  if($(this).prop("checked")){
			  scripts[$(this).parent().parent().attr("name")]=$(this).parent().parent().attr("value")
			  $(this).siblings().css('background-color', '#468847');
			//alert(JSON.stringify(dockerfileconf))  /// object to string
		  }
		  else{
			  delete scripts[$(this).parent().parent().attr("name")]
			  $(this).siblings().css('background-color', '#999999');
		  }
	 })
  });
  //load bundleList.scala.html..   load page from controllers.LaunchController.getHtml via routes
  $("#bundlePage").load("/views/bundleList",function(){
	  $("#bundlePage #bundle-list-table").on("change","#addBtn",function(){
		//after bundleList.scala.html, bind click event to addBtn to select script
		  if($(this).prop("checked")){
			  var str=$(this).parent().parent().attr("value").toUpperCase() + " /nfsdir/bundle/"+$(this).parent().parent().attr("name")
			  envs[$(this).parent().parent().attr("name")]=str
			  bind($(this).parent().parent().attr("name"),$(this).parent().parent().attr("value"))
			  $(this).siblings().css('background-color', '#468847');			  
		  }
		  else{
			  delete envs[$(this).parent().parent().attr("name")]
			  $(this).siblings().css('background-color', '#999999');
		  }
	 })
  });
  //load bundleList.scala.html..   load page from controllers.LaunchController.getHtml via routes
  $("#exePage").load("/views/exeList",function(){
	  $("#exePage #exe-list-table").on("change","#addBtn",function(){
		//after exeList.scala.html, bind click event to addBtn to select script
		  if($(this).prop("checked")){
			  var str=$(this).parent().parent().attr("value").toUpperCase() + " /nfsdir/exe/"+$(this).parent().parent().attr("name")
			  envs[$(this).parent().parent().attr("name")]=str
			  bind($(this).parent().parent().attr("name"),$(this).parent().parent().attr("value"))
			  $(this).siblings().css('background-color', '#468847');
		  }
		  else{
			  delete envs[$(this).parent().parent().attr("name")]
			  $(this).siblings().css('background-color', '#999999');
		  }
	 })
  });
	$('#tableTab a').click(function(e){
		e.preventDefault()
		$(this).tab('show')
	})
	$('#tableTab a:first').tab('show')
// Set bootstarp tab content baseImageList, scriptList, bundleList, exeList to create user custom baseImage END /////////

	
	
// set job information , file information to fileConf, sizeObj.  And add html element to job List. And submit job  START////
  $("#finish-button").click(function(){
	  fileConf.pipeline=$("#textbox").val();	 // pipeline script form user input
	
	  sizeObj.file1=$("#file").val().replace(/C:\\fakepath\\/i, '') 
	  sizeObj[$("#file").val().replace(/C:\\fakepath\\/i, '')]=document.getElementById("file").files[0].size;

	  if(pair==1){
		  sizeObj.file2=$("#file2").val().replace(/C:\\fakepath\\/i, '')
		  sizeObj[$("#file2").val().replace(/C:\\fakepath\\/i, '')]=document.getElementById("file2").files[0].size;
	  }
	  
	  if(jCheck==0){ // when click search button jCheck=1  
		  if(conf.listNum<10){ // Because list table default 10 row , if table row under 10, apend <td></td> element to empty <tr></tr> 			  
		  var td= "<td id='user-id'>"+fileConf.uId+"</td><td>"+fileConf.jobName+"</td><td id='job-type'>"+"Normal"+"</td><td id='status'><span class='label label-fileupload'>FileUploading</span></td><td id='date'>"+"??"+"</td></tr></tr>"; 	  
    	 	$('.job-list-table'+" #"+(conf.listNum)).attr("name",fileConf.jobName);
    	 	$("div[name=acc"+conf.listNum+"]").attr("id","acc"+fileConf.jobName);
    	 	$("#"+conf.listNum).html(td);
        	conf.listNum+=1;
      		}
      	else if (conf.listNum>=10){ // If table row >=10, append new <tr></tr> element 
     	 	$('.job-list-table').append("<tr id='"+conf.listNum+"' name='"+fileConf.jobName+"' data-toggle='collapse' data-target='' class='accordion-toggle'><td id='user-id'>"+conf.uId+"</td><td id='job-name'>"+fileConf.jobName+"</td>"
     			+ "<td id='job-type'>"+"Normal"+"</td><td id='status'><span class='label label-fileupload'>FileUploading</span></td><td id='date'>"+"??"+"</td></tr>");
     	 	$('.job-list-table').append("<tr><td colspan='5' class='hiddenRow'><div><div class='col-sm-12'><div id='acc"+fileConf.jobName+"' name='acc"+conf.listNum+"' class='accodian-body collapse' class='padding'><h3>Shell Script</h3><p id='script'>insert shell</p><hr><h3>Log Information</h3><p id='log'>log</p><hr></div></div></div></td></tr>")
     	 	conf.listNum+=1;     	 
      	}
	  }
	  
	  dockerFileConf.env=envs;  // this object's controll functions are located in /public/js/bundleList.js and /public/js/exeList.js
	  dockerFileConf.script=scripts; // this object's controll functions are located in /public/js/envScriptList.js
	  
    if(pair==0){
      $("#file2").remove();
    }
    
    var formData = new FormData($("#fileForm")[0]); // get form date form '#fileForm' element (in main.scala.html) 
    var size=sizeObj;
    var obj = fileConf;
    var dockerfile= dockerFileConf;
    
    dialogInstance1.close(); // bootstrap dialog close.
    dialogInstance1=null;
    mCheck=0;
       
    if(uploadWin==null){  // if uploadWin(progress bar ) is null open new window
    	// load uploadWindow.scala.html from controllers.LaunchController.getHtml via routes
		uploadWin = window.open("views/uploadWindow","");				
		uploadWin.onload= function(){				
			uploadWin.receiveFromParent(formData,size,obj,dockerfile);  //this function located in /public/js/uploadWin.js
    	}
	}
	else{ // if uploadWin(progress bar) is already loaded just append new progress bar to uploadWin 
		uploadWin.focus();
		alert("Check upload window!")
		uploadWin.receiveFromParent(formData,sizeObj,obj,dockerfile);				
	}
    
    // initialize job configuration(fileConf), file information(sizeObj), custom baseImage configuration(dockerFileConf)
    sizeObj=new Object();
    fileConf=new Object();
    scripts = new Object();
    envs = new Object();
    dockerFileConf=new Object();     
  })
});

// this function bind selected element(configure custom baseImage..ex: baseImage, bundle, exe) to auto-change ex: bwa selected -> $BWA
function bind(key,replace){
	$("#textbox").bind("keyup",function(){		
		  var re = new RegExp('\\S*'+key,'g')
		  var temp=$("#textbox").val();
		  if(re.test(temp)){ 
			  $("#textbox").val(temp.replace(re,"$"+replace));			  
		  }  		  
	});
}
