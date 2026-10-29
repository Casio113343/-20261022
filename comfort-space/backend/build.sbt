ThisBuild / scalaVersion := "3.3.5"
ThisBuild / organization := "qiyu"
ThisBuild / version := "0.2.0"

lazy val root = project
  .in(file("."))
  .settings(
    name := "qiyu-backend",
    Compile / mainClass := Some("services.system.Main"),
    libraryDependencies ++= Seq(
      "org.typelevel" %% "cats-effect" % "3.5.7",
      "org.http4s" %% "http4s-ember-server" % "0.23.30",
      "org.http4s" %% "http4s-dsl" % "0.23.30",
      "org.http4s" %% "http4s-circe" % "0.23.30",
      "io.circe" %% "circe-generic" % "0.14.10",
      "io.circe" %% "circe-parser" % "0.14.10",
      "org.postgresql" % "postgresql" % "42.7.5",
      "com.zaxxer" % "HikariCP" % "6.2.1",
      "org.slf4j" % "slf4j-simple" % "2.0.16",
      "org.typelevel" %% "munit-cats-effect" % "2.0.0" % Test
    ),
    Compile / run / fork := true,
    Test / fork := true,
    Test / parallelExecution := false,
    javaOptions ++= Seq(
      "-Dfile.encoding=UTF-8",
      "-Dstdout.encoding=UTF-8",
      "-Dstderr.encoding=UTF-8",
      "-Dorg.slf4j.simpleLogger.defaultLogLevel=warn"
    ),
    scalacOptions ++= Seq("-deprecation", "-feature", "-unchecked")
  )
