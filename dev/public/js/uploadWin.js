/**
 * 
 */
// create progress bar. 
// all file Upload run in uploadWin page. so main page is independent
function receiveFromParent(formData, sizeConf, conf, dockerfile){
	var url;
	var html;
	var name;
	var progress;
	//ajax post to controller.LaunchController.uploadCustom with job configuration(fileConf), file information(sizeObj), custom baseImage configuration(dockerFileConf) via route
	if(conf.type=="File Upload"){
		console.log(sizeConf)
		url="/fileupload"+"?size="+JSON.stringify(sizeConf)+"&conf="+JSON.stringify(conf)+"&dockerfile="+JSON.stringify(dockerfile);
		html="<div class='form-group'><div class='col-sm-4'><label class='control-label col-sm-4' for='bundleName'>"+conf.type +" : " + conf.jobName+"</label></div><div div class='col-sm-8'><div class = 'progress'><div id='"+conf.jobName+"' class = 'progress-bar' role = 'progressbar' aria-valuenow = '60' aria-valuemin = '0' aria-valuemax = '100' style = 'width: 0%;'><span class = 'sr-only'>40% Complete</span></div></div></div></div>";
		name=conf.jobName;
		
	}
	else if(conf.type=="Bundle Upload"){
		url="/bundleupload"+"?size="+JSON.stringify(sizeConf)+"&conf="+JSON.stringify(conf);
		html="<div class='form-group'><div class='col-sm-4'><label class='control-label col-sm-4' for='bundleName'>"+conf.type +" : "+ conf.fileName+"</label></div><div div class='col-sm-8'><div class = 'progress'><div id='"+conf.bundleName+"' class = 'progress-bar' role = 'progressbar' aria-valuenow = '60' aria-valuemin = '0' aria-valuemax = '100' style = 'width: 0%;'><span class = 'sr-only'>40% Complete</span></div></div></div></div>";
		name=conf.bundleName
		
		
	}
	else{
		url="/exeupload"+"?size="+JSON.stringify(sizeConf)+"&conf="+JSON.stringify(conf);
		html="<div class='form-group'><div class='col-sm-4'><label class='control-label col-sm-4' for='exeName'>"+conf.type +" : "+ conf.fileName+"</label></div><div div class='col-sm-8'><div class = 'progress'><div id='"+conf.exeName+"' class = 'progress-bar' role = 'progressbar' aria-valuenow = '60' aria-valuemin = '0' aria-valuemax = '100' style = 'width: 0%;'><span class = 'sr-only'>40% Complete</span></div></div></div></div>";
		name=conf.exeName
		
	}
	document.getElementById("uploadWin").innerHTML += html;	
	// ajax fileupload progress bar
	$.ajax({
	    crossOrigin: true,     
	    url: url,
	    type: "POST",
	    processData: false,
	    contentType:false,
	    data: formData,
	    xhr: function() {
	        var xhr = $.ajaxSettings.xhr();
	        xhr.upload.onprogress = function(e) {
	        	progress=document.getElementById(name);
	        	progress.style.width = Math.ceil(e.loaded/e.total*100)  + '%';
	        };
	        return xhr;
	    },
	    success: function(response) {
	        
	    }
	});
}




