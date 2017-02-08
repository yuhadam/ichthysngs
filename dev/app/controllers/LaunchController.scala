package controllers

import play.api.mvc._
import play.api._
import play.api.Logger
import play.api.i18n._
import javax.inject.Inject
import models._
import play.api.data._
import play.api.data.Forms._
import scala.sys.process._
import java.util.Date
import java.io._
import java.text.SimpleDateFormat
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.test._
import java.io.{ FileWriter, FileOutputStream, File }
import controllers._
import play.api.libs.Files.TemporaryFile
import play.api.mvc.MultipartFormData.FilePart
import java.nio.file.attribute.PosixFilePermission._
import java.nio.file.attribute.PosixFilePermissions
import java.nio.file.{ Files, Path }
import java.nio.file.Paths
import java.util
import akka.stream.IOResult
import akka.stream.scaladsl._
import akka.util.ByteString
import akka.actor._
import akka.stream.Materializer

import play.api.libs.streams._
import play.api.mvc.MultipartFormData.FilePart
import play.api.libs.streams.Accumulator
import play.core.parsers.Multipart.FileInfo
import scala.concurrent.Future
import java.io.ByteArrayOutputStream
import play.api.libs.iteratee.Iteratee
import play.api.mvc.{ BodyParser, MultipartFormData }
import scala.concurrent.ExecutionContext.Implicits.global
import play.core.parsers.Multipart
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import akka.util.ByteString
import java.nio.file.attribute.BasicFileAttributes
import akka.stream.scaladsl.{ FileIO, Sink }
import akka.stream.scaladsl.FileIO
import java.nio.file.StandardOpenOption
import akka.stream.SinkShape
import akka.NotUsed
import reflect.io._
import play.api.libs.json._

import slick.dbio
import slick.dbio.Effect.Read
import play.api.db.slick.DatabaseConfigProvider
import slick.driver.JdbcProfile
import scala.sys.process._
import scala.concurrent.Await
import scala.concurrent.duration
import scala.util.{ Failure, Success }
import scala.concurrent.duration.Duration
import play.api.cache._
import play.api.libs.json._


/// Main controller call database CRUD funciton, fileUpload, job submit...
// all Models(database table:User,Image(+TmpPipeline),Pipeline,Env(Exe,Bundle),EnvScript,BaseImage) are declared in controller's parameter(check each model class)
class LaunchController @Inject() (implicit system: ActorSystem, materializer: Materializer, val messagesApi: MessagesApi, userModel: UserModel, imageModel: ImageModel, pipelineModel: PipelineModel, envModel: EnvModel,baseImageModel:BaseImageModel, envScriptModel:EnvScriptModel, cache: CacheApi) extends Controller with I18nSupport {
 
/// login.js call these methods START//////////////////////
  
  ///Get parameter from request about login information
  def loginUser = Action { implicit request =>    
    val jsonData=request.body.asFormUrlEncoded
    val typeVal = jsonData.get("type")(0)    // typeVal : login or register
    val idVal = jsonData.get("id")(0)    
    val pwdVal = jsonData.get("pwd")(0)
    
    //Type=login ,Read User table to check db has user information. If login success create session that contain logined user information  
    if(typeVal == "login") {             
      val loginData=User(0,idVal,"",pwdVal)
      val checkVal = userModel.retrieve(loginData,1) //(all db CRUD function located in /models)
      if(checkVal.length == 0) {
        Ok("check id or password")
      } else {       
        Ok("success").withSession("uId"-> idVal, "pwd"-> pwdVal)
      }      
    }
    
    //Type=register, Insert user information to User table.  Add user to sftp group by run '/bin/sftp-seradd.sh(this script added to server, when https://www.github.com/ichthysngs/ichthysngs builded)'
    else {
       val emailVal = jsonData.get("email")(0)
       val loginData = User(0, idVal,emailVal, pwdVal)       
      userModel.insert(loginData)     //(all db CRUD function located in /models)
      val sftp=Seq("sftp-useradd.sh",idVal,pwdVal)
      Process(sftp).run
      Ok("success")
      .withSession("uId"->idVal, "pwd"-> pwdVal)
    }
  }
  
  
  // When uId text focusout run this method. Read User table to check db has duplicated user information.
  def idDupCheck = Action { implicit request =>
    val Data = request.body.asFormUrlEncoded.get.get("id").get(0)
    val userData=User(0,Data,"","")
    val foundId = userModel.retrieve(userData,2)     //(all db CRUD function located in /models)
    if(foundId.length != 0) {
      Ok("1")
    } else {
      Ok("0")
    } 
  }
  def logoutUser = Action { implicit request => Redirect(routes.PageController.loginPage()).withNewSession }
  
/// login.js call these methods END//////////////////////  
 
// main.js call this method START/////  
  //Get default conf(master if) from User table
  def getDefaultConf= Action{implicit request =>
      val userData=User(0,"admin","","")
      val result=userModel.retrieve(userData, 2)//(all db CRUD function located in /models)
      Ok(result(0).uEmail)
      
    }
// main.js call this method END/////
  
  
// jobList.js call these methods START///
  def getImageTable(limit:Int) = Action { implicit request =>
    val imageData = imageModel.joinTableRetrieve(request.session.get("uId").getOrElse("none"),"",limit); //(all db CRUD function located in /models)
    val jsonArray =  imageData.map { x => 
             Json.obj("pIndex" -> x._1.pIndex, "imgName" -> x._1.imgName, "jobName" -> x._1.jobName, "jobType" -> x._1.jobType, "parentInfo" -> x._1.parentInfo,
                 "status" -> x._1.status, "date" -> x._1.date, "uId" -> x._1.uId, "log" -> {if(!x._2.isEmpty) x._2.get.log; else ""}, "script" -> {if(!x._2.isEmpty) x._2.get.script; else ""})       
       }    
     val json = JsArray(jsonArray)
     Ok(json.toString())
  }
     def getSearchTable(flag:Int, value:String) = Action { implicit request =>      
      val imageData = imageModel.joinTableRetrieve(request.session.get("uId").getOrElse("none"),value,flag) //(all db CRUD function located in /models)
      val jsonArray =  imageData.map { x => 
          Json.obj("pIndex" -> x._1.pIndex, "imgName" -> x._1.imgName, "jobName" -> x._1.jobName, "jobType" -> x._1.jobType, "parentInfo" -> x._1.parentInfo,
                 "status" -> x._1.status, "date" -> x._1.date, "uId" -> x._1.uId, "log" -> {if(!x._2.isEmpty) x._2.get.log; else ""}, "script" -> {if(!x._2.isEmpty) x._2.get.script; else ""})
     } 
      val json = JsArray(jsonArray)
     Ok(json.toString())
  }
// jobList.js call these methods END///     
     
     
     
// bundleList.js call these methods START///     
     def getBundleTable(limit:Int) = Action { implicit request =>
       val bundleData = envModel.bundleTableRetrieve("", limit); //(all db CRUD function located in /models)
       val jsonArray = bundleData.map { x => Json.obj("bundleName" -> x.bundleName, "description" -> x.description, "uId" -> x.uId, "location" -> x.location, "envName" ->x.envName ) }
       val json = JsArray(jsonArray)
       Ok(json.toString())
     }
       def getBundleSearchTable(flag:Int, value:String) = Action { implicit request =>
      val bundleData = envModel.bundleTableRetrieve(value, flag) //(all db CRUD function located in /models)
      val jsonArray =  bundleData.map { x => 
         Json.obj("bundleName" -> x.bundleName, "description"->x.description,"uId" -> x.uId, "location" -> x.location, "envName" ->x.envName )
      }
      val json = JsArray(jsonArray)
     Ok(json.toString())
    }
// bundleList.js call these methods END///       
      
       
// exeList.js call these methods START///       
      def getExeTable(limit:Int) = Action { implicit request =>
       val exeData = envModel.exeTableRetrieve("", limit); //(all db CRUD function located in /models)
       val jsonArray = exeData.map { x => Json.obj("exeName" -> x.exeName, "description" -> x.description, "uId" -> x.uId, "location" -> x.location, "envName" ->x.envName ) }
       val json = JsArray(jsonArray)
       Ok(json.toString())
     }
       def getExeSearchTable(flag:Int, value:String) = Action { implicit request =>
      val exeData = envModel.exeTableRetrieve(value, flag) //(all db CRUD function located in /models)
      val jsonArray =  exeData.map { x => 
         Json.obj("exeName" -> x.exeName, "description"->x.description,"uId" -> x.uId, "location" -> x.location, "envName" ->x.envName )
      }
      val json = JsArray(jsonArray)
     Ok(json.toString())
    }
// exeList.js call these methods END///       
       
// baseImageList.js call these methods START///       
     def getBaseImageTable(limit:Int) = Action { implicit request =>
       val baseImageData = baseImageModel.retrieve("", limit,""); //(all db CRUD function located in /models)
       val jsonArray = baseImageData.map { x => Json.obj("imgName" -> x.imgName, "osType" -> x.osType, "dockerFile" -> x.dockerFile, "description"->x.description, "uId" -> x.uId) }
       val json = JsArray(jsonArray)
       Ok(json.toString())
     }
      def getBaseImageSearchTable(flag:Int, value:String, osType:String) = Action { implicit request =>
      val baseImageData = baseImageModel.retrieve(value, flag, osType) //(all db CRUD function located in /models)
      val jsonArray =  baseImageData.map { x => 
         Json.obj("imgName" -> x.imgName,"osType"->x.osType, "dockerFile"->x.dockerFile,"description" -> x.description, "uId" -> x.uId)
      }
      val json = JsArray(jsonArray)
     Ok(json.toString())
    }
// baseImageList.js call these methods END///     
      
      
// scriptList.js call these methods START///      
    def getScriptTable(limit:Int) = Action { implicit request =>
       val scriptData = envScriptModel.retrieve("", limit,""); //(all db CRUD function located in /models)
       val jsonArray = scriptData.map { x => Json.obj("scriptName" -> x.scriptName, "osType" -> x.osType,"script" -> x.script, "description"->x.description, "uId" -> x.uId) }
       val json = JsArray(jsonArray)
       Ok(json.toString())
     }
      def getScriptSearchTable(flag:Int, value:String, osType:String) = Action { implicit request =>
      val scriptData = envScriptModel.retrieve(value, flag,osType) //(all db CRUD function located in /models)
      val jsonArray =  scriptData.map { x => 
         Json.obj("scriptName" -> x.scriptName,"osType"->x.osType, "script"->x.script,"description" -> x.description, "uId" -> x.uId)
      }
      val json = JsArray(jsonArray)
     Ok(json.toString())
    }  
// scriptList.js call these methods END///  

// jobCreate.js call this method START//      
  def jobDupCheck= Action{ implicit request =>
    val jobData = request.body.asFormUrlEncoded.get.get("jobName").get(0)
    val foundjob= imageModel.retrieve(jobData,1) //(all db CRUD function located in /models)
    if(foundjob.length!=0) {
      Ok("1")
    } else {
      Ok("0")
    } 
  }
// jobCreate.js call this method END//
  
// bundleUpload.js call this method START//  
  def bundleDupCheck= Action { implicit request =>
    val data = request.body.asFormUrlEncoded.get.get("bundleName").get(0)
    val foundBundle=envModel.bundleTableRetrieve(data, 4) //(all db CRUD function located in /models)
    if(foundBundle.length !=0){
      Ok("1")
    }
    else
      Ok("0")
  }
// bundleUpload.js call this method END//  

// exeUpload.js call this method START//    
    def exeDupCheck= Action { implicit request =>
    val data = request.body.asFormUrlEncoded.get.get("exeName").get(0)
    val foundExe=envModel.exeTableRetrieve(data, 4) //(all db CRUD function located in /models)
    if(foundExe.length !=0){
      Ok("1")
    }
    else
      Ok("0")
  }
// bundleUpload.js call this method END//      

// baseImageUpload.js call this method START//
    // baseImageUpload is not yet implemented 
   def baseImageDupCheck= Action { implicit request =>
    val data = request.body.asFormUrlEncoded.get.get("imgName").get(0)
    Logger.debug(data)
    val foundBaseImage=baseImageModel.retrieve(data, 5,"") //(all db CRUD function located in /models)
    if(foundBaseImage.length !=0){
      Ok("1")
    }
    else
      Ok("0")
  }
// baseImageUpload.js call this method END//
   
// scriptUpload.js call this method START//   
   def scriptDupCheck= Action { implicit request =>
    val scriptName = request.body.asFormUrlEncoded.get.get("scriptName").get(0)
    val foundScript=envScriptModel.retrieve(scriptName, 5,"") //(all db CRUD function located in /models)
    if(foundScript.length !=0){
      Ok("1")
    }
    else
      Ok("0")
  }
// scriptUpload.js call this method END//
    
     
    
    
//uploadWin.js call these methods START//
   // get job configuration, input file information, dockerfile configuration and insert Image table, TmpPipeline table.
  type FilePartHandler[A] = FileInfo => Accumulator[ByteString, FilePart[A]]
  def handleFilePartAsFile(size:String,conf:String): FilePartHandler[File] = {
    case FileInfo(partName, filename, contentType) =>     
      val sizeJson= Json.parse(size)
      val filesize= (sizeJson \ filename).as[Long]      
      val config= Json.parse(conf)
      val jobName = (config \ "jobName").as[String]
      val pipeline= (config \ "pipeline").as[String]
      val jobType ="Normal"
      val parentInfo = ""
      val cpu = (config \ "cpu").as[String]
      val mem = (config \ "mem").as[String]
      val uId = (config \"uId").as[String]
      val path= "/nfsdir/"+(config \ "uId").as[String]+"/"+jobName
      val currentDate=(new SimpleDateFormat("yyyy-MM-dd-HH-mm-ss")).format(new Date).toString()
      val uri = (config \ "uri").as[String]
      val imageData=Image(0,uri+":5000/"+jobName,jobName,jobType,parentInfo,"FileUploading",currentDate,uId)
      val tmpPipelineData=TmpPipeline(jobName,"",pipeline)
      if(imageModel.retrieve(jobName, 1).isEmpty){ // call insert function to Image, Tmppippeline db (all db CRUD function located in /models)
        imageModel.insert(imageData);
        imageModel.insertTmpPipeline(tmpPipelineData)        
        Process("mkdir -p " + path).run
        Process("chmod 777 " + path).run
      }
      
      val filepath = Paths.get("/nfsdir/"+uId+"/"+filename+"_"+jobName)
      val filesink: Sink[ByteString, Future[IOResult]] = FileIO.toPath(filepath, Set(StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE))
      val accumulator = Accumulator(filesink)
      
      accumulator.map {
        case IOResult(count, status) =>{
          // check if uploaded size(count)==filesize 
          if(filesize==count){// successfully uploaded 
            FilePart(partName, filename+"_"+jobName, contentType, filepath.toFile()) // for unique fileName, concat filename and jobName path= /nfsdir/%U/fileName_jobName
          }
           else{ // upload fail
             imageModel.update(jobName,"FileUploadFail")  //db state update
             WebSocketActor.sendMessage(Json.stringify(Json.obj("jobName"->jobName,"status"->"FileUploadFail","data"->"null")), uId)  //check /controllers/WebSocketController 
             Logger.debug("nononoonon")
             Process("rm -rf " +path).run
             FilePart(partName, "no", contentType, filepath.toFile()) //fileName = no
           }
        }
      }(play.api.libs.concurrent.Execution.defaultContext)
  }
  // this method run after handleFilePartAsFile method run .
  def uploadCustom(size:String, conf:String, dockerfile:String) = Action{parse.multipartFormData(handleFilePartAsFile(size,conf), 100000000000L)}{ request =>
      val config= Json.parse(conf)
      val pipeline =(config \ "pipeline").as[String]
      val jobName = (config \ "jobName").as[String]
      val uId = (config \"uId").as[String]
      val path= "/nfsdir/"+(config \ "uId").as[String]
      val cpu= (config \ "cpu").as[String]
      val mem= (config \ "mem").as[String]
      val uri= (config \ "uri").as[String]
      
      
      val dockerFile= Json.parse(dockerfile)
      val dockerFrom=(dockerFile \ "from").as[String]   // baseImage that user select in baseImageList (mChek==1)
      
      val dockerEnv =(dockerFile \ "env").as[JsObject]  // env(bundle,exe)that user select in bundleList,exeList (mChek==1) 
      val dockerScript=(dockerFile \ "script").as[JsObject] //script that user select in scriptList (mChek==1)
      var str=""
       
    val fileOption = request.body.file("file").map {  
    case FilePart(key, filename, contentType, file) =>
      if(filename!="no"){  // filename != no is file upload success 
        writingDockerfile(uri,jobName,path,dockerFrom,dockerEnv,dockerScript) 
        writingDockerJson(uri,jobName,path,cpu,mem)        
        writingInnerSh(size,pipeline,path,uId,jobName,uri)
         if(imageModel.retrieve("Running",2).length>=4){  // if Running job >= , new job is pending
          imageModel.update(jobName,"Pending")  
          WebSocketActor.sendMessage(Json.stringify(Json.obj("jobName"->jobName,"status"->"Pending","data"-> pipeline)), uId)
          str="Pending"
        }
        else{          // Running job <4 , new job Running
          imageModel.update(jobName,"Running")
          WebSocketActor.sendMessage(Json.stringify(Json.obj("jobName"->jobName,"status"->"Running","data"->pipeline)), uId)
          val launch=Seq("launch.sh",jobName,path+"/"+jobName,uri)  // job image build,push, chronos job submit by run '/bin/sftp-seradd.sh(this launch.sh added to server, when https://www.github.com/ichthysngs/ichthysngs builded)'
          Process(launch).run

          str="Running"
          }               
        Logger.debug("upload success")
     }
    else{
        Logger.debug("upload fail");
        WebSocketActor.sendMessage(Json.stringify(Json.obj("jobName"->jobName,"status"->"FileUploadFail","data"->"null")), uId)
        str="FileUploadFail"
     }
    }
      Ok(str)
  }

  //bundle file upload  same logic with handleFilePartAsFile 
   def handleFilePartAsBundleFile(size:String,conf:String): FilePartHandler[File] = {
    case FileInfo(partName, filename, contentType) =>     
      val config= Json.parse(conf)
      val bundleName =(config \ "bundleName").as[String]
      val description=(config \ "description").as[String]
      val uId = (config \ "uId").as[String]      
        
      val sizeJson= Json.parse(size)
      val bundlesize= (sizeJson \ filename).as[Long]
      
      val bundlepath = Paths.get("/nfsdir/bundle/"+bundleName)
      val bundlesink: Sink[ByteString, Future[IOResult]] = FileIO.toPath(bundlepath, Set(StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE))
      val accumulator = Accumulator(bundlesink)
      
      val bundleData = Bundle(bundleName,description,uId,"/nfsdir/bundle/"+bundleName,bundleName.toUpperCase())
      envModel.insertBundle(bundleData)
      accumulator.map {        
        case IOResult(count, status) =>{
          if(bundlesize==count){
            FilePart(partName, bundleName, contentType, bundlepath.toFile())  // path = /nfsdir/bundle/bundleName
          }
           else{
             Process("rm -rf /nfsdir/bundle/"+bundleName).run
             envModel.deleteBundle(bundleName)
             FilePart(partName, "no", contentType, bundlepath.toFile())
           }
        }
      }(play.api.libs.concurrent.Execution.defaultContext)
  }
  //same logic with uploadCustom
  def uploadCustomBundle(size:String, conf:String) = Action{parse.multipartFormData(handleFilePartAsBundleFile(size,conf), 100000000000L)}{ request =>
    val config= Json.parse(conf)
    val bundleName =(config \ "bundleName").as[String]
    val description=(config \ "description").as[String]
    val uId = (config \ "uId").as[String]
      
      
    val fileOption = request.body.file("file").map {
    case FilePart(key, filename, contentType, file) =>
      if(filename=="no"){
        envModel.deleteBundle(bundleName)  
      }

    }
    Ok("asdf")
  }
  
   //bundle file upload  same logic with handleFilePartAsFile
     def handleFilePartAsExeFile(size:String,conf:String): FilePartHandler[File] = {
    case FileInfo(partName, filename, contentType) =>     
      val config= Json.parse(conf)
      val exeName =(config \ "exeName").as[String]
      val description=(config \ "description").as[String]     
      
      val uId = (config \ "uId").as[String]      
        
      val sizeJson= Json.parse(size)
      val exesize= (sizeJson \ filename).as[Long]
      
      val exepath = Paths.get("/nfsdir/exe/"+filename)
      val exesink: Sink[ByteString, Future[IOResult]] = FileIO.toPath(exepath, Set(StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE))
      val accumulator = Accumulator(exesink)
            
      val exeData = Exe(filename,description,uId,"/nfsdir/exe/"+filename,exeName.toUpperCase())
      envModel.insertExe(exeData)
      accumulator.map {        
        case IOResult(count, status) =>{
          if(exesize==count){
            FilePart(partName, filename, contentType, exepath.toFile())  // path= /nfsdir/exe/filename
          }
           else{
             Process("rm -rf /nfsdir/exe/"+filename).run
             envModel.deleteExe(filename)
             FilePart(partName, "no", contentType, exepath.toFile())
           }
        }
      }(play.api.libs.concurrent.Execution.defaultContext)
  }
  //same logic with uploadCustom
  def uploadCustomExe(size:String, conf:String) = Action{parse.multipartFormData(handleFilePartAsExeFile(size,conf), 100000000000L)}{ request =>
    val config= Json.parse(conf)
    val exeName =(config \ "exeName").as[String]
    val description=(config \ "description").as[String]
    val uId = (config \ "uId").as[String]
      
      
    val fileOption = request.body.file("file").map {
    case FilePart(key, filename, contentType, file) =>
      if(filename=="no"){
        envModel.deleteExe(filename)  
      }

    }
    Ok("asdf")
  }
//uploadWin.js call these methods START//
  
   //bundle file upload  same logic with handleFilePartAsFile
   def uploadCustomBaseImage(conf:String) = Action{implicit request =>
      val config= Json.parse(conf)
      val imgName =(config \ "imgName").as[String]
      val osType=(config \ "osType").as[String]
      val dockerFile =(config \ "dockerFile").as[String]
      val description=(config \ "description").as[String]
      val uId = (config \ "uId").as[String]
      val baseImage = BaseImage(imgName,osType,dockerFile,description,uId)
      baseImageModel.insert(baseImage)
      Ok("asdf")
    }
   //same logic with uploadCustom
   def uploadCustomScript(conf:String) = Action{implicit request =>
      val config= Json.parse(conf)
      val scriptName =(config \ "scriptName").as[String]
      val osType=(config \ "osType").as[String]
      val script =(config \ "script").as[String]
      val description=(config \ "description").as[String]
      val uId = (config \ "uId").as[String]
      val envScript = EnvScript(scriptName,osType,script,description,uId)
      envScriptModel.insert(envScript)
      Ok("asdf")
    }
  
  
///  
// this function called in /bin/launch.sh  all job successfully executed, curl with request
  def success = Action{
    implicit request =>
      val urlencode = request.body.asFormUrlEncoded
      val jobName=urlencode.get("jobName")(0)
      val uId = urlencode.get("uId")(0)
      val fileJson= Json.parse(urlencode.get("fileName")(0))
      val fileName= ( fileJson \ "file1").as[String]
      val filePath= urlencode.get("filePath")(0)
      val path=filePath+"/"+jobName
      val uri = urlencode.get("uri")(0)
      // if success remove except result file
      Process("rm -rf "+path+"/"+fileName).run
      Process("rm -rf "+path+"/docker.json").run
      Process("rm -rf "+path+"/Dockerfile").run
      Process("rm -rf "+path+"/innerSh.sh").run
      Process("rm -rf "+path+"/chronos.txt").run
      Process("cp -r "+path+"/"+jobName+" /log/").run
      Process("rm -rf "+filePath+"/"+fileName+"_"+jobName).run
      
      // if job mode is pair file2 also should be removed
      (fileJson \ "file2").asOpt[String] match {
      case Some(data) => 
        {
          Process("rm -rf "+filePath+"/"+data+"_"+jobName).run
          Process("rm -rf "+path+"/"+data).run
        }
      case None => Logger.debug("no have file2") 
      }
      Process("mv -f "+path+" /home/"+uId+"/").run
      imageModel.update(jobName,"Success")
     
      
      // in server, log stored in /log/+jobName . mkString log and call wesocket..
      try{
        var log=""
      for(line <- scala.io.Source.fromFile("/log/"+jobName).mkString){
          log+=line
        } 
        Logger.debug("aaa"+ log)
        imageModel.updateTmpPipeline(jobName, log)
         WebSocketActor.sendMessage(Json.stringify(Json.obj("jobName"->jobName,"status"->"Success","data"->log)), uId)      
      } catch {
        case ex: Exception => println(ex)
      }
      
      // After success job pending job exist in db , run pending job by running launch.sh 
      val pendingJob=imageModel.retrieve("Pending", 2)
      if(pendingJob.length>=1){
        imageModel.update(pendingJob(0).jobName, "Running")
        val launch=Seq("launch.sh",pendingJob(0).jobName,"/nfsdir/"+pendingJob(0).uId+"/"+pendingJob(0).jobName,uri)
        Process(launch).run
        WebSocketActor.sendMessage(Json.stringify(Json.obj("jobName"->pendingJob(0).jobName,"status"->"Running","data"->"null")),pendingJob(0).uId)
      }      
      Ok("\njob success\n")
  }
  
  // this function called by only chronos (this chronos option set when https://www.github.com/ichthysngs/installserver builded ...) 
  def fail = Action{
    implicit request =>
       val jobName =(request.body.asJson.get.\("job")).as[String]     
       val job=imageModel.retrieve(jobName, 1)
       val uId = job(0).uId
       val filePath = "/nfsdir/"+uId+"/"+jobName
       val sqlite=Seq("sqlite3", "/shellscript/ichthys.db","select uEmail from user where uId='admin';") // get defaultlconfiguration(master ip)
       val log= Process(sqlite).!!
       Process("cp -r "+filePath+"/"+jobName+" /log/").run
       Process("rm -rf "+filePath).run
       imageModel.update(jobName,"Fail")      
       
       try{
         var log=""
        for(line <- scala.io.Source.fromFile("/log/"+jobName).mkString){
          log+=line
        }
        imageModel.updateTmpPipeline(jobName, log)
        WebSocketActor.sendMessage(Json.stringify(Json.obj("jobName"->jobName,"status"->"Fail","data"->log)), uId)      
      } catch {
        case ex: Exception => println(ex)
        }
      // After fail job pending job exist in db , run pending job by running launch.sh
       val pendingJob=imageModel.retrieve("Pending", 2)
      if(pendingJob.length>=1){
        imageModel.update(pendingJob(0).jobName, "Running")
        val launch=Seq("launch.sh",pendingJob(0).jobName,"/nfsdir/"+pendingJob(0).uId+"/"+pendingJob(0).jobName,log)
        Process(launch).run
        WebSocketActor.sendMessage(Json.stringify(Json.obj("jobName"->pendingJob(0).jobName,"status"->"Running","data"->"null")),pendingJob(0).uId)
      }
      Ok("aa")
  }

//write Dockerfile (FROM = baseImage that user select, RUN : script that user select, ENV : bundle,exe that user select )
  private def writingDockerfile(uri:String, jobName:String, filePath: String, from:String, env:JsObject, script:JsObject) = {
    val bw = new BufferedWriter(new FileWriter(filePath +"/"+jobName+ "/Dockerfile"))
    bw.write("FROM "+uri+":5000/"+from)
    bw.newLine()
    script.fields.map{f=>bw.write("RUN "+f._2.toString().replace("\"", "")); bw.newLine()}   // ex)  script{scriptName:script} _.2== script
    env.fields.map{f=>bw.write("ENV "+f._2.toString().replace("\"", "")); bw.newLine()}  //ex) env{exeName:envName,  bundleName:envName} _.2== envName
    bw.write("WORKDIR " + filePath + "/"+jobName)
    bw.newLine()
    bw.close()
  }
  
//write Innersh 
  private def writingInnerSh(files: String, pipeline:String, filePath: String,uId:String, jobName:String, uri:String) = {
    val bw = new BufferedWriter(new FileWriter(filePath +"/"+jobName+ "/innerSh.sh"))
    val fileJson= Json.parse(files)
    val fileName= ( fileJson \ "file1").as[String]
    
    bw.write("#! /bin/sh")
    bw.newLine()
    bw.write("set -e")
    bw.newLine()
    bw.write("set -x")
    bw.newLine()
    
    // hardlink /nfsdir/%U/fileName_jobName to /nfsdir/%U/fileName      
    bw.write("ln "+filePath+"/"+fileName+"_"+jobName+" "+filePath+"/"+jobName+"/"+fileName)
    bw.newLine()    
    (fileJson \ "file2").asOpt[String] match {
      case Some(data) => bw.write("ln "+filePath+"/"+data+"_"+jobName+" "+filePath+"/"+jobName+"/"+data)
      case None => Logger.debug("no have file2") 
    }
    bw.newLine()
    
    // write script (tokenize by newline)
    pipeline.split("\\r?\\n").map { line => bw.write(line);bw.newLine() }
    
    // this curl submit data to success method
    bw.write("curl -X POST --data-urlencode 'jobName="+jobName+"' --data-urlencode 'uId="+uId+"' --data-urlencode 'fileName="+files+"' --data-urlencode 'filePath="+filePath+"' --data-urlencode 'uri="+uri+"' http://"+uri+":9001/success")
    bw.newLine()
    bw.close()
    Process("chmod 777 "+filePath+"/"+jobName+"/innerSh.sh").run
  }

//write Docker.json
 private def writingDockerJson(uri:String,jobName:String,filePath:String,cpu:String,mem:String){
    val bw = new BufferedWriter(new FileWriter(filePath + "/"+jobName+"/docker.json"))
    bw.write("{")
    bw.newLine()
    bw.write("\"schedule\": \"R1/2014-09-25T17:22:00Z/PT2M\",")
    bw.newLine()
    bw.write("\"name\":\""+jobName+"\",")
    bw.newLine()
    bw.write("\"container\": {")
    bw.newLine()
    bw.write("\"type\": \"DOCKER\",")
    bw.newLine()
    bw.write("\"image\":\""+uri+":5000/"+jobName+"\"," )
    bw.newLine()
    bw.write("\"network\": \"BRIDGE\",")
    bw.newLine()
    bw.write("\"volumes\": [")
    bw.newLine()
    bw.write("{")
    bw.newLine()
    bw.write("\"containerPath\": \"/nfsdir\",")
    bw.newLine()
    bw.write("\"hostPath\": \"/nfsdir\",")
    bw.newLine()
    bw.write("\"mode\":\"RW\"")
    bw.newLine()
    bw.write("}")
    bw.newLine()
    bw.write("]")
    bw.newLine()
    bw.write("},")
    bw.newLine()
    bw.write("\"cpus\":\""+cpu+"\",")
    bw.newLine()
    bw.write("\"mem\":\""+mem+"\",")
    bw.newLine()
    bw.write("\"uris\": [],")
    bw.newLine()
    bw.write("\"command\":\""+filePath+"/"+jobName+"/innerSh.sh > "+jobName+" 2>&1\"")
    bw.newLine()
    bw.write("}")
    bw.newLine()
    bw.close()   
  }
}