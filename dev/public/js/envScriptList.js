/**
 * 
 */
var cnt =0;
var addBtn;
var empty;
function getScriptTable(count){
	
  if(count==0){
	  $("#scriptPrevious").hide();
  }
  else{
	  $("#scriptPrevious").show();
  } 
  
  var arr = [];
  $.ajax({
    type: 'GET' ,
    url: "/getScriptTable/"+count ,
    crossOrigin: true,
    success: function(e) {
      var a1 = JSON.parse(e);
      var x;
      for( x in a1) {
        var scriptobject = new Object();
        scriptobject.scriptName = a1[x].scriptName;
        scriptobject.osType=a1[x].osType;
        scriptobject.script = a1[x].script;
        scriptobject.description = a1[x].description;
        scriptobject.uId = a1[x].uId;
        if(mCheck==1){
        	if(scripts.hasOwnProperty(a1[x].scriptName)){
        		scriptobject.add = "<td><input type='checkbox' id='addBtn' checked='checked' /> <span class='badge' > check</span></td>";
        	}
        	else{
        		scriptobject.add = "<td><input type='checkbox' id='addBtn' /> <span class='badge' > check</span></td>";
        	}
        }
        else{
        	scriptobject.add=""
        }
        arr.push(scriptobject);
      }       
      for(y in arr) {    	  
    	 $("#script-list-table").append("<tr id='"+y+"' name='"+arr[y].scriptName+"' value='"+arr[y].script+"' data-toggle='collapse' data-target='#acc"+arr[y].scriptName+"' class='accordion-toggle' ><td>"+arr[y].scriptName+"</td><td>"+arr[y].osType+"</td><td>"+arr[y].description+"</td><td>"+arr[y].uId+"</td>"+arr[y].add+"</tr>");
    	 $('#script-list-table').append("<tr name='script' ><td colspan='5' class='hiddenRow'><div><div class='col-sm-12'><div name='acc"+y+"' id='acc"+arr[y].scriptName+"' class='accodian-body collapse' class='padding'><h3>Script</h3><p>"+arr[y].script+"</p></div></div></div></td></tr>");
    	 scriptConf.listNum=arr.length;
      }
      if(arr.length<10){
    	   for(var i = arr.length; i<10; i++){
    		   $("#script-list-table").append("<tr id='"+i+"' data-toggle='collapse'  class='accordion-toggle' ><td>&nbsp</td><td></td><td></td><td></td>"+empty+"</tr>");    		   
    		   $('#script-list-table').append("<tr name='script'><td colspan='5' class='hiddenRow'><div><div class='col-sm-12'><div name='acc"+i+"' class='accodian-body collapse' class='padding'><h3>Script</h3><p name='script'></p></div></div></div></td></tr>");
    	   }
      }
    }               
  });
  	
}
function getScriptSearchTable(flag,value,osType){
	sCheck=1;
	$("#scriptPrevious").hide();
	$("#scriptNext").hide();
	var arr = [];
		$.ajax({
			type: 'GET' ,
		    url: "/getScriptSearchTable?flag="+flag+"&value="+value+"&osType="+osType ,
		    crossOrigin: true,
		    success:function(e){
		    	var a1 = JSON.parse(e);
		        var x;
		        for( x in a1) {
		          var scriptobject = new Object();
		          scriptobject.scriptName = a1[x].scriptName;
		          scriptobject.osType=a1[x].osType;
		          scriptobject.script = a1[x].script;
		          scriptobject.description = a1[x].description;
		          scriptobject.uId = a1[x].uId;
		          if(mCheck==1){
		        	  if(scripts.hasOwnProperty(a1[x].scriptName)){
		          		scriptobject.add = "<td><input type='checkbox' id='addBtn' checked='checked' /> <span class='badge' > check</span></td>";
		          	}
		          	else{
		          		scriptobject.add = "<td><input type='checkbox' id='addBtn' /> <span class='badge' > check</span></td>";
		          	}
		          }
		          else{
		        	  scriptobject.add=""
		          }
		          arr.push(scriptobject);
		        } 
		        var y=0;
		        for(y in arr) {
		        	$("#script-list-table").append("<tr id='"+y+"' name='"+arr[y].scriptName+"' value='"+arr[y].script+"' data-toggle='collapse' data-target='#acc"+arr[y].scriptName+"' class='accordion-toggle' ><td>"+arr[y].scriptName+"</td><td>"+arr[y].osType+"</td><td>"+arr[y].description+"</td><td>"+arr[y].uId+"</td>"+arr[y].add+"</tr>");		        	
		        	$('#script-list-table').append("<tr name='script' value='"+arr[y].script+"'><td colspan='5' class='hiddenRow'><div><div class='col-sm-12'><div name='acc"+y+"' id='acc"+arr[y].scriptName+"' class='accodian-body collapse' class='padding'><h3>Script</h3><p>"+arr[y].script+"</p></div></div></div></td></tr>");
		     	}
		        if(y<10){
		        	 for(var i = y; i<10; i++){
		        		 $("#script-list-table").append("<tr id='"+i+"' data-toggle='collapse'  class='accordion-toggle' ><td>&nbsp</td><td></td><td></td><td></td>"+empty+"</tr>");
		      		   $('#script-list-table').append("<tr name='script'><td colspan='5' class='hiddenRow'><div><div class='col-sm-12'><div name='acc"+i+"' class='accodian-body collapse' class='padding'><h3>Script</h3><p></p></div></div></div></td></tr>");		        	    	   
		      	   }
		        }
		    }
		})
}

$(document).ready(function(){
	scriptConf.listNum=0;
	cnt=0;
	getScriptTable(cnt);	  
	
	 if(mCheck==1 ){
////		  addBtn="<td><a class='btn btn-green-3' id='addBtn'> Select </a></td>";
//		  addBtn="<td><input type='checkbox' id='addBtn' checked='checked' /> <span class='badge' > check</span></td>";		  
		  empty="<td></td>";
		  $("#scriptHead").append("<th>ADD</th>");
	  }
	  else{
//		  addBtn="";
		  empty="";	  
	  }
	
	$("#scriptPrevious").click(function(){		
		cnt-=10;
		$('#script-list-table').empty();
		getScriptTable(cnt)
	})
	$("#scriptNext").click(function(){
		cnt+=10;
		$('#script-list-table').empty();
		getScriptTable(cnt)
	})
	
	$("#scriptSearchBtn").click(function(){
		var osTypeSelect=$("#osTypeSelect").val();
		var searchSelect= $("#scriptSearchSelect").val();
		var inp= $("#scriptSearchInp").val();
		cnt=0;
		if(searchSelect=="ScriptName"){
			$("#script-list-table").empty();
			getScriptSearchTable(1,inp,osTypeSelect)
		}
		else if(searchSelect=="Script"){
			$("#script-list-table").empty();
			getScriptSearchTable(2,inp,osTypeSelect)
		}
		else if(searchSelect=="Description"){
			$("#script-list-table").empty();
			getScriptSearchTable(3,inp,osTypeSelect)
		}		
		else{
			$("#script-list-table").empty();
			getScriptSearchTable(4,inp,osTypeSelect)
		}		
	})
	$("#initScriptList").click(function(){
		sCheck=0;
		cnt=0;
		$("#script-list-table").empty();
		getScriptTable(cnt);
		$("#scriptNext").show();
	})
	
	
});
