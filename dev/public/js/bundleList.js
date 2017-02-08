/**
 * 
 */
var cnt =0;
var empty;
function getBundleTable(count){
//
	
  if(count==0){
	  $("#bundlePrevious").hide();
  }
  else{
	 $("#bundlePrevious").show();
  }  
  
  var arr = [];
  $.ajax({
    type: 'GET' ,
    url: "/getBundleTable/"+count ,
    crossOrigin: true,
    success: function(e) {
      var a1 = JSON.parse(e);
      var x;
      for( x in a1) {
        var bundleobject = new Object();
        bundleobject.bundleName = a1[x].bundleName;
        bundleobject.description = a1[x].description;
        bundleobject.uId = a1[x].uId;
        bundleobject.location=a1[x].location;
        bundleobject.envName=a1[x].envName;
        if(mCheck==1){
        	if(envs.hasOwnProperty(a1[x].bundleName)){
          		bundleobject.add = "<td><input type='checkbox' id='addBtn' checked='checked' /> <span class='badge' > check</span></td>";
        	}
        	else{
          		bundleobject.add = "<td><input type='checkbox' id='addBtn' /> <span class='badge' > check</span></td>";
        	}
        }
        else{
        	bundleobject.add=""
        }
        arr.push(bundleobject);
      }       
      for(y in arr) {
       $("#bundle-list-table").append("<tr id='"+y+"' name='"+arr[y].bundleName+"' value='"+arr[y].envName+"'><td>"+arr[y].bundleName+"</td><td>"+arr[y].description+"</td><td>"+arr[y].uId+"</td><td>"+arr[y].location+"</td><td>$"+arr[y].envName+"</td>"+arr[y].add+"</tr>")
       bundleConf.listNum=arr.length;
      }
      if(arr.length<10){
    	   for(var i = arr.length; i<10; i++){
    		   $("#bundle-list-table").append("<tr id='"+i+"'><td>&nbsp</td><td></td><td></td><td></td><td></td>"+empty+"</tr>");
    	   }
      }
    }               
  }); 
}
function getBundleSearchTable(flag,value){
	bCheck=1;
	$("#bundlePrevious").hide();
	$("#bundleNext").hide();
	var arr = [];
		$.ajax({
			type: 'GET' ,
		    url: "/getBundleSearchTable?flag="+flag+"&value="+value ,
		    crossOrigin: true,
		    success:function(e){
		    	var a1 = JSON.parse(e);
		        var x;
		        for( x in a1) {
		          var bundleobject = new Object();
		          bundleobject.bundleName = a1[x].bundleName;
		          bundleobject.description = a1[x].description;
		          bundleobject.uId = a1[x].uId;
		          bundleobject.location=a1[x].location;
		          bundleobject.envName=a1[x].envName;
		          if(mCheck==1){
		        	  if(envs.hasOwnProperty(a1[x].bundleName)){
		        	  bundleobject.add = "<td><input type='checkbox' id='addBtn' checked='checked' /> <span class='badge' > check</span></td>";
		          	}
		          	else{
		        	  bundleobject.add = "<td><input type='checkbox' id='addBtn' /> <span class='badge' > check</span></td>";
		          	}
		          }
		          else{
		        	  bundleobject.add=""
		          }
		          arr.push(bundleobject);
		        } 
		        var y=0;
		        for(y in arr) {
		     	   $("#bundle-list-table").append("<tr id='"+y+"' name='"+arr[y].bundleName+"' value='"+arr[y].envName+"'><td>"+arr[y].bundleName+"</td><td>"+arr[y].description+"</td><td>"+arr[y].uId+"</td><td>"+arr[y].location+"</td><td>$"+arr[y].envName+"</td>"+bundleobject.add+"</tr>")
		     	}
		        if(y<10){
		        	 for(var i = y; i<10; i++){
		        		   $("#bundle-list-table").append("<tr id='"+i+"'><td>&nbsp</td><td></td><td></td><td></td><td></td>"+empty+"</tr>");		        	    	   
		      	   }
		        }
		    }
		})
}
$(document).ready(function(){
	bundleConf.listNum=0;
	cnt=0;
	getBundleTable(cnt);
	
	if(mCheck==1){
		  empty="<td></td>";
		  $("#bundleHead").append("<th>ADD</th>");
	  }
	  else{
		  empty="";
	  }
	
	$("#bundlePrevious").click(function(){		
		cnt-=10;
		$('#bundle-list-table').empty();
		getBundleTable(cnt)
	})
	$("#bundleNext").click(function(){
		cnt+=10;
		$('#bundle-list-table').empty();
		getBundleTable(cnt)
	})
	
	$("#bundleSearchBtn").click(function(){
		
		var searchSelect= $("#bundleSearchSelect").val();
		var inp= $("#bundleSearchInp").val();
		cnt=0;
		if(searchSelect=="bundleName"){
			$("#bundle-list-table").empty();
			getBundleSearchTable(1,inp)
		}
		else if(searchSelect=="description"){
			$("#bundle-list-table").empty();
			getBundleSearchTable(2,inp)
		}
		else{
			$("#bundle-list-table").empty();
			getBundleSearchTable(3,inp)
		}		
	})
	$("#initBundleList").click(function(){
		bCheck=0;
		cnt=0;
		$("#bundle-list-table").empty();
		getBundleTable(cnt);
		$("#bundleNext").show();
	})
});
