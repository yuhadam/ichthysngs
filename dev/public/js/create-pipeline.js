/**
 * 
 */
var stepCnt = 0;
var cnt = 0;
var modalSfw;
var modalForm;
var json = new Array();

function addButton(html) {
  var obj = new Object();
  obj.exe = html;
  obj.order = ++cnt;
  obj.deleted = "no";
  json.push(obj);
  $("#next-button").hide();
}
function deleteButton(html) {

}
function getHtml(obj) {
  $.ajax({
  url : '/views/' + obj.exe,
  type : 'GET',
  crossOrigin: true,
  
  async : 'false',
  success : function(data) {
    modalSfw.addStep(obj.order, $(data));
  }
  });
}
function getKeys() {

  for (var i = 0; i < json.length; i++) {
    getHtml(json[i]);
  }
  stepCnt = json.length
}
function htmlTojson() {
  for (var i = 0; i < cnt; i++) {
    var html = json[i].exe;
    $('#' + html + ' input').serializeObject(json[i]);
  }
  // postJson();
}
function postJson() {
  $.ajax({
    
  type : 'POST',
  url : "/analysis",
  data : {
    // "conf": conf,
    "pipeline" : JSON.stringify(json)
  },
  beforeSend : function(XMLHttpRequest) {
    // Upload progress
    XMLHttpRequest.upload.addEventListener("progress", function(evt) {
      if (evt.lengthComputable) {
        var percentComplete = evt.loaded / evt.total;
        console.log(percentComplete);
      }
    }, false);
  },
  success : function(e) {
    //alert(e.message);
  }
  });
}
function getFileSize(id) {
  return document.getElementById(id).files[0].size;
}

$(document).ready(function() {
  $.fn.serializeObject = function(obj) {
    try {
      var arr = this.serializeArray();
      if (arr) {
        jQuery.each(arr, function() {
          obj[this.name] = this.value;
        });
      }
    } catch (e) {
      alert(e.message);
    } finally {
    }
  };
  modalSfw = $("#wizard_example2").stepFormWizard({
  height : 'auto',
  nextBtn : $('<a class="next-btn sf-right sf-btn" id="next-button" href="#">NEXT</a>'),
  finishBtn : $('<input class="finish-btn sf-right sf-btn" id="finish-button"  value="FINISH"/>')
  });
  $("#finish-button").hide();
  $("#addStep-button").click(function() {
    if (cnt == 0) {
      alert("check one or more pipeline")
    } else {
      if (cnt != stepCnt) {
        $("#finish-button").hide();
        for (; stepCnt > 0; --stepCnt) {
          modalSfw.removeStep(stepCnt);
        }
        stepCnt = 0;
        getKeys();
        $("#finish-button").show();
      }
      modalSfw.refresh();
      modalSfw.next();
      $("next-button").show();
    }
  });

  $("#finish-button").click(function() {
    htmlTojson();

    $('.job-list-table').append("<tr id='" + conf.jobName + "'><td id='user-id'>" + conf.uId + "</td><td id='job-name'>" + conf.jobName + "</td>" + "<td id='job-type'>" + conf.jobType + "</td><td id='parent-info'>" + conf.parentInfo + "</td>" + "<td id='status'><spam class='label label-fileupload'>FileUploading</span></td><td id='date'>" + "??" + "</td><td><button type='button' class='btn btn-info'>View Result</button></td></tr>");

    var fileSize = getFileSize("file");

    $("#json").attr("value", JSON.stringify(json));
    var formData = new FormData($("#fileForm")[0]);

    dialogInstance1.close();
    $.ajax({
    type : "post",
    url : "/fileupload" + "?size=" + fileSize + "&conf=" + JSON.stringify(conf),
    // processData: true,
    crossOrigin: true,
  
    contentType : false,
    dataType : json,
    data : formData,
    success : function(data) {
      alert(data)
    },
    error : function(err) {
      alert(err)
    }

    })

  });
});
$(window).load(function() {
  $(".sf-step").mCustomScrollbar({
  theme : "dark-3",
  scrollButtons : {
    enable : true
  }
  });

});
