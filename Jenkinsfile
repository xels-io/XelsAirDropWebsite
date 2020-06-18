pipeline {
  agent any
  
  stages {
  
    stage('Git Checkout') {
      steps {
        git credentialsId: 'github-mahfuz', url: 'https://github.com/xels-io/XelsAirDropWebsite.git'
      }
    }
    stage('Build') {
      steps {
        bat label: 'Package Installing', script: 'npm install'
      }
    }
    stage('Deploy') {
      steps {
        bat './scripts/deploy.bat'
      }
    }
    
  }
}