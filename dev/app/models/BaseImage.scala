package models

import javax.inject.Inject
import play.api.db.slick.DatabaseConfigProvider
import slick.dbio
import slick.dbio.Effect.Read
import slick.driver.JdbcProfile
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import play.api.Logger
import play.api.cache._
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import slick.lifted._


case class BaseImage(imgName:String, osType:String, dockerFile:String,description:String, uId:String)


class BaseImageModel @Inject()(protected val dbConfigProvider: DatabaseConfigProvider){
  
  val dbConfig = dbConfigProvider.get[JdbcProfile]
  val db = dbConfig.db
  
  import dbConfig.driver.api._
  

  
    
  class BaseImageTable(tag: Tag) extends Table[BaseImage](tag, "BASEIMAGE") {

    def imgName = column[String]("imgName",O.PrimaryKey)
    def osType = column[String]("osType")
    def dockerFile = column[String]("dockerFile")
    def description=column[String]("description")
    def uId = column[String]("uId")    

    def * = (imgName, osType, dockerFile,description, uId) <> (BaseImage.tupled, BaseImage.unapply)
  }
    val BaseImages = TableQuery[BaseImageTable]
  
    def insert(baseImageData:BaseImage)=db.run(DBIO.seq( BaseImages += baseImageData ))

    def delete(imgName: String)= db.run(BaseImages.filter{_.imgName === imgName}.delete)
    
    def retrieve(data: String, flag:Int, osType:String):Seq[BaseImage]= {
      if(flag>=10 || flag==0){
        val dbRetrieve = db.run(compiledBaseImage(flag,flag+10).result)
        val result =Await.result(dbRetrieve, Duration.Inf)
        return result
     }
     else if (flag==1){
        val dbRetrieve = db.run(compiledCheckByBaseImageName("%"+data+"%",osType).result)
        val result =Await.result(dbRetrieve, Duration.Inf)
        return result
     }
     else if(flag==2){
        val dbRetrieve = db.run(compiledCheckByBaseImageDockerFile("%"+data+"%",osType).result)
        val result =Await.result(dbRetrieve, Duration.Inf)
        return result
     }
     else if(flag==3){
        val dbRetrieve = db.run(compiledCheckByBaseImageDescription("%"+data+"%",osType).result)
        val result =Await.result(dbRetrieve, Duration.Inf)
        return result
     }
     else if (flag==4){
        val dbRetrieve = db.run(compiledCheckById("%"+data+"%",osType).result)
        val result =Await.result(dbRetrieve, Duration.Inf)
        return result
     }
  
      else {
        val dbRetrieve = db.run(compiledCheckByBaseImageDupName(data).result)
        val result =Await.result(dbRetrieve, Duration.Inf)
        return result
      }
    }

    def baseImageCheck(limit:ConstColumn[Long], max:ConstColumn[Long]) =  BaseImages.sortBy(_.uId).sortBy(_.imgName).drop(limit).take((max)).sortBy (_.osType.desc) 
    def compiledBaseImage = Compiled(baseImageCheck _)
    
    def checkByBaseImageName(imgName:Rep[String],osType:Rep[String]) = BaseImages.filter{baseImage=>baseImage.osType===osType}.filter{ baseImage => baseImage.imgName like imgName }.sortBy(_.uId).sortBy { _.imgName.asc } 
    def compiledCheckByBaseImageName = Compiled(checkByBaseImageName _)
    
    def checkByBaseImageDescription(description:Rep[String],osType:Rep[String]) = BaseImages.filter{baseImage=>baseImage.osType===osType}.filter{ baseImage => baseImage.description like description }.sortBy(_.uId).sortBy { _.imgName.asc } 
    def compiledCheckByBaseImageDescription = Compiled(checkByBaseImageDescription _)

    def checkByBaseImageDockerFile(dockerfile:Rep[String],osType:Rep[String]) = BaseImages.filter{baseImage=>baseImage.osType===osType}.filter{ baseImage => baseImage.dockerFile like dockerfile }.sortBy(_.uId).sortBy { _.imgName.asc } 
    def compiledCheckByBaseImageDockerFile = Compiled(checkByBaseImageDockerFile _)
    
    def checkById(uId:Rep[String],osType:Rep[String]) = BaseImages.filter{baseImage=>baseImage.osType===osType}.filter{ baseImage => baseImage.uId like uId }.sortBy(_.uId).sortBy { _.imgName.asc } 
    def compiledCheckById = Compiled(checkById _)

    def checkByBaseImageDupName(imgName:Rep[String]) = BaseImages.filter{ baseImage => baseImage.imgName === imgName } 
    def compiledCheckByBaseImageDupName = Compiled(checkByBaseImageDupName _)
    
    
    
  
}