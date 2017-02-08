package models

import javax.inject._
import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import models._
import slick.dbio
import slick.dbio.Effect.Read
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.db.slick.DatabaseConfigProvider
import slick.driver.JdbcProfile
import scala.sys.process._
import scala.concurrent.Future
import scala.concurrent.Await
import scala.concurrent.duration
import scala.util.{Failure, Success}
import scala.concurrent.duration.Duration
import play.api.cache._
import java.util.Date


case class Image(pIndex:Int, imgName:String, jobName:String, jobType:String, parentInfo:String, status:String, date:String, uId:String)

case class TmpPipeline(jobName:String,log:String,script:String)



class ImageModel @Inject()(protected val dbConfigProvider: DatabaseConfigProvider){
  
  val dbConfig = dbConfigProvider.get[JdbcProfile]
  val db = dbConfig.db
  
  import dbConfig.driver.api._

  
  class ImageTable(tag: Tag) extends Table[Image](tag, "Image") {

    def pIndex = column[Int]("pIndex", O.AutoInc, O.PrimaryKey)
    def imgName = column[String]("imgName")
    def jobName = column[String]("jobName")
    def jobType = column[String]("jobType")
    def parentInfo = column[String]("parentInfo")
    def status = column[String]("status")
    def date = column[String]("date")
    def uId = column[String]("uId")   
    def * = (pIndex, imgName, jobName, jobType, parentInfo, status, date ,uId) <> (Image.tupled, Image.unapply)    
  }
  
  
  class TmpPipelineTable(tag: Tag) extends Table[TmpPipeline](tag, "TmpPipeline") {
    def jobName = column[String]("jobName", O.PrimaryKey)
    def log = column[String]("log")
    def script = column[String]("script") 
    def * = (jobName, log, script) <> (TmpPipeline.tupled, TmpPipeline.unapply)
  }
   
   
    val Images = TableQuery[ImageTable]    
    val TmpPipelines = TableQuery[TmpPipelineTable]
    val Joins = for {
                  (i, t) <- Images joinLeft TmpPipelines on (_.jobName === _.jobName)
                } yield (i,t)
  
    def insert(imageData:Image)=db.run(DBIO.seq( Images += imageData ))
    def insertTmpPipeline(tmpPipelineData:TmpPipeline)=db.run(DBIO.seq( TmpPipelines += tmpPipelineData ))

   def update(jobName: String, status:String)={
      val q = for { image <- Images if image.jobName === jobName } yield image.status
      val updateAction = db.run(q.update(status));
    }
   def updateTmpPipeline(jobName:String, log: String)={
     val q = for { tmppipeline <- TmpPipelines if tmppipeline.jobName === jobName } yield tmppipeline.log
      val updateAction = db.run(q.update(log));
   }
   
   def delete(pIndex: Int)= db.run(Images.filter{_.pIndex === pIndex}.result)
   def deleteTmpPipeline(jobName:String)= db.run(TmpPipelines.filter{_.jobName === jobName}.result)
    
    def retrieve(data: String,flag: Int):Seq[Image]= {
     if(flag==1){
      val dbRetrieve = db.run(compiledCheckByName(data).result)
      val result =Await.result(dbRetrieve, Duration.Inf)
       return result
     }
     else if(flag==2){
      val dbRetrieve = db.run(compiledCheckByStatus(data).result)
      val result =Await.result(dbRetrieve, Duration.Inf)
        return result
     }

     else{
       return null;
     }
    }

   def joinTableRetrieve(uId:String, data:String, flag:Int):Seq[(Image,Option[TmpPipeline])]={
     if(flag>=10 || flag==0){
      val dbRetrieve = db.run(compiledCheckById(uId,flag,flag+10).result)
      val result =Await.result(dbRetrieve, Duration.Inf)
      return result
     }
     else if (flag==1){
      val dbRetrieve = db.run(compiledCheckByIdName("%"+data+"%",uId).result)
      val result =Await.result(dbRetrieve, Duration.Inf)
      return result
     }
     else{    
      val dbRetrieve = db.run(compiledCheckByIdStatus(data,uId).result)
      val result =Await.result(dbRetrieve, Duration.Inf)
      return result       
     }
   }
   
    def checkByName(jobName:Rep[String]) = Images.filter{image => image.jobName === jobName}
    def compiledCheckByName = Compiled(checkByName _)
   
    def checkByStatus(status:Rep[String]) = Images.filter{image => image.status === status}.sortBy(_.date.asc)
    def compiledCheckByStatus = Compiled(checkByStatus _)
   
    
    def checkById(uId:Rep[String],limit:ConstColumn[Long], max:ConstColumn[Long]) =  Joins.filter{tuple => tuple._1.uId === uId}.sortBy(_._1.date.asc).drop(limit).take((max)) 
    def compiledCheckById = Compiled(checkById _)
    
    def checkByIdName(jobName:Rep[String],uId:Rep[String]) = Joins.filter{tuple =>tuple._1.jobName like jobName}.sortBy(_._1.date.asc).filter(tuple=> tuple._1.uId===uId)
    def compiledCheckByIdName = Compiled(checkByIdName _)
    
    def checkByIdStatus(status:Rep[String],uId:Rep[String]) = Joins.filter{tuple => tuple._1.uId === uId && tuple._1.status===status}.sortBy(_._1.date.asc)
    def compiledCheckByIdStatus = Compiled(checkByIdStatus _)
    
   
}