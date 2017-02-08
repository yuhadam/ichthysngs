package controllers

import play.api._
import play.api.mvc._
import akka.actor._
import akka.stream.Materializer
import play.api.libs.streams._
import javax.inject._


// Page controller : all html(play-templete) loaded these methods. check html files that under /views/ directory 

class PageController @Inject() (implicit system: ActorSystem, materializer: Materializer) extends Controller{
  
  //  /views/login.scala.html   ,   /public/js/login.js 
    def loginPage = Action { implicit request =>
      Ok(views.html.login())
    }
    // /views/main.scala.html,     /public/js/main.js , /public/js/jobCreate.js, /public/js/bundleUpload.js, /public/js/exeUpload.js, /public/js/baseImageUpload.js, /public/js/envScriptUpload.js 
    def main = Action { implicit request =>
      request.session.get("uId") match{    // if request has session that equal uId, load main page else back to login page
        // Submit uid parameter to main.scala.html. main page is outline of dashboard. When specific page loaded, replace '#content'(check main.scala.html), just replace content not reload 
        case Some(v) => Ok(views.html.main(v))  
        case None   => Ok(views.html.login())
      }
    }

  //  get request parameter and load specific page to '#content' in main.scala.html  
   def getHtml(data: String) = Action {
    implicit request =>
      val text = "views.html." + data
      Logger.debug(text)
      if (data == "pipeline")
        Ok(views.html.pipeline())
      
      //  /views/jobCreate.scala.html,   
      else if(data=="jobCreate")
        Ok(views.html.jobCreate())  
      // /views/jobList.scala.html,     /public/js/jobList.js
      else if(data=="jobList")
        Ok(views.html.jobList())
      // /views/message.scala.html,     /public/js/message.js  
      else if (data == "message")
         Ok(views.html.message())
      
        
      else if(data=="bundleUpload")
        Ok(views.html.bundleUpload())
      else if(data=="bundleList")
        Ok(views.html.bundleList())
        
      else if(data=="exeUpload")
        Ok(views.html.exeUpload())
      else if(data=="exeList")
        Ok(views.html.exeList())
        
      else if(data=="baseImageUpload")
        Ok(views.html.baseImageUpload())
      else if(data=="baseImageList")
        Ok(views.html.baseImageList())
        
      else if(data=="scriptUpload")
        Ok(views.html.envScriptUpload())
      else if(data=="envScriptList")
        Ok(views.html.envScriptList())
        
      // /views/uploadPage.scala.html,      /public/js/uploadPage.jS   
      else if(data=="uploadPage")
        Ok(views.html.uploadPage())
      // /views/uploadWindow.scala.html,      /public/js/uploadwindow.js
      else if(data=="uploadWindow")
        Ok(views.html.uploadWindow())
        
        
      else
        Ok(views.html.directory())
  }
   def socket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef(out => WebSocketActor.props(out))
  }
}