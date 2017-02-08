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


case class Bundle(bundleName:String,description:String,uId:String,location:String,envName:String)

case class Exe(exeName:String,description:String,uId:String,location:String,envName:String)


class EnvModel @Inject()(protected val dbConfigProvider: DatabaseConfigProvider){
  
  val dbConfig = dbConfigProvider.get[JdbcProfile]
  val db = dbConfig.db
  
  import dbConfig.driver.api._
  

  
    
  class BundleTable(tag: Tag) extends Table[Bundle](tag, "BUNDLE") {

    def bundleName = column[String]("bundleName")
    def description=column[String]("description")
    def uId = column[String]("uId")
    def location =column[String]("location")
    def envName=column[String]("envName")
    
    def * = (bundleName, description, uId, location, envName) <> (Bundle.tupled, Bundle.unapply)
  }
  
  class ExeTable(tag: Tag) extends Table[Exe](tag, "EXE") {

    def exeName = column[String]("exeName")
    def description=column[String]("description")
    def uId = column[String]("uId")    
    def location =column[String]("location")
    def envName=column[String]("envName")
    
    def * = (exeName, description,uId,location,envName) <> (Exe.tupled, Exe.unapply)
  }
  
    val Bundles = TableQuery[BundleTable]
    
    val Exes= TableQuery[ExeTable]
  
    def insertBundle(bundleData:Bundle)=db.run(DBIO.seq( Bundles += bundleData ))
    def insertExe(exeData:Exe)=db.run(DBIO.seq(Exes+=exeData))

    def deleteBundle(bundleName: String)= db.run(Bundles.filter{_.bundleName === bundleName}.delete)
    def deleteExe(exeName:String)=db.run(Exes.filter { _.exeName === exeName }.delete)
    

    def bundleTableRetrieve(data:String, flag:Int):Seq[Bundle]={
     if(flag>=10 || flag==0){
      val dbRetrieve = db.run(compiledBundle(flag,flag+10).result)
      val result =Await.result(dbRetrieve, Duration.Inf)
      return result
     }
     else if (flag==1){
      val dbRetrieve = db.run(compiledCheckByBundleName("%"+data+"%").result)
      val result =Await.result(dbRetrieve, Duration.Inf)
      return result
     }
     else if(flag==2){
      val dbRetrieve = db.run(compiledCheckByBundleDescription("%"+data+"%").result)
      val result =Await.result(dbRetrieve, Duration.Inf)
      return result
     }
     else if(flag==3){
      val dbRetrieve = db.run(compiledCheckByBundleId("%"+data+"%").result)
      val result =Await.result(dbRetrieve, Duration.Inf)
      return result
     }
     else{
      val dbRetrieve = db.run(compiledCheckByDupBundleName(data).result)
      val result =Await.result(dbRetrieve, Duration.Inf)
      return result
     }
   }
    
     def exeTableRetrieve(data:String, flag:Int):Seq[Exe]={
     if(flag>=10 || flag==0){
      val dbRetrieve = db.run(compiledExe(flag,flag+10).result)
      val result =Await.result(dbRetrieve, Duration.Inf)
      return result
     }
     else if (flag==1){
      val dbRetrieve = db.run(compiledCheckByExeName("%"+data+"%").result)
      val result =Await.result(dbRetrieve, Duration.Inf)
      return result
     }
     else if(flag==2){
      val dbRetrieve = db.run(compiledCheckByExeDescription("%"+data+"%").result)
      val result =Await.result(dbRetrieve, Duration.Inf)
      return result
     }
     else if(flag==3){
      val dbRetrieve = db.run(compiledCheckByExeId("%"+data+"%").result)
      val result =Await.result(dbRetrieve, Duration.Inf)
      return result
     }
     else{
      val dbRetrieve = db.run(compiledCheckByDupExeName(data).result)
      val result =Await.result(dbRetrieve, Duration.Inf)
      return result
     }
   }
    
      
    
    def bundleBundleCheck(limit:ConstColumn[Long], max:ConstColumn[Long]) =  Bundles.sortBy(_.bundleName).drop(limit).take((max)) 
    def compiledBundle = Compiled(bundleBundleCheck _)
    
    def checkByBundleName(bundleName:Rep[String]) = Bundles.filter{ bundle => bundle.bundleName like bundleName }.sortBy { _.bundleName.asc } 
    def compiledCheckByBundleName = Compiled(checkByBundleName _)
    
    def checkByBundleDescription(description:Rep[String]) = Bundles.filter{ bundle => bundle.description like description }.sortBy { _.bundleName.asc } 
    def compiledCheckByBundleDescription = Compiled(checkByBundleDescription _)

    def checkByBundleId(uId:Rep[String]) = Bundles.filter{ bundle => bundle.uId like uId }.sortBy { _.bundleName.asc } 
    def compiledCheckByBundleId = Compiled(checkByBundleId _)
    
    def checkByDupBundleName(bundleName:Rep[String]) = Bundles.filter{ bundle => bundle.bundleName === bundleName } 
    def compiledCheckByDupBundleName = Compiled(checkByDupBundleName _)
    
    def exeCheck(limit:ConstColumn[Long], max:ConstColumn[Long]) =  Exes.sortBy(_.uId).sortBy(_.exeName).drop(limit).take((max)) 
    def compiledExe = Compiled(exeCheck _)
    
    def checkByExeName(exeName:Rep[String]) = Exes.filter{ exe => exe.exeName like exeName }.sortBy(_.uId).sortBy { _.exeName.asc } 
    def compiledCheckByExeName = Compiled(checkByExeName _)
    
    def checkByExeDescription(description:Rep[String]) = Exes.filter{ exe => exe.description like description }.sortBy(_.uId).sortBy { _.exeName.asc } 
    def compiledCheckByExeDescription = Compiled(checkByExeDescription _)

    def checkByExeId(uId:Rep[String]) = Exes.filter{ exe => exe.uId like uId }.sortBy(_.uId).sortBy { _.exeName.asc } 
    def compiledCheckByExeId = Compiled(checkByExeId _)
    
    def checkByDupExeName(exeName:Rep[String]) = Exes.filter{ exe => exe.exeName === exeName } 
    def compiledCheckByDupExeName = Compiled(checkByDupExeName _)
    
    
    
    
    
  
}