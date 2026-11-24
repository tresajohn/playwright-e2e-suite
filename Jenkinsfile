pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.49.1-jammy'
            args '-u root:root'
        }
    }

    environment {
        CI = 'true'
        NODE_ENV = 'test'
        HUSKY = '0'
    }

    parameters {
        choice(
            name: 'TEST_TYPE',
            choices: ['all', 'smoke', 'regression'],
            description: 'Which tests to run'
        )
        choice(
            name: 'BROWSER',
            choices: ['chromium', 'firefox', 'all'],
            description: 'Browser project (applies to smoke runs)'
        )
        string(
            name: 'SHARD_COUNT',
            defaultValue: '4',
            description: 'Number of parallel shards (used when TEST_TYPE=all)'
        )
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        ansiColor('xterm')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Validate') {
            steps {
                sh 'npm run validate'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    if (params.TEST_TYPE == 'smoke') {
                        def proj = params.BROWSER != 'all' ? "--project=${params.BROWSER}" : ''
                        sh "npx playwright test --grep '@smoke' ${proj}"
                    } else if (params.TEST_TYPE == 'regression') {
                        sh "npx playwright test --grep '@regression'"
                    } else {
                        def count = params.SHARD_COUNT.toInteger()
                        def shards = [:]
                        for (int i = 1; i <= count; i++) {
                            def shardIndex = i
                            shards["Shard ${shardIndex}/${count}"] = {
                                sh "npx playwright test --shard=${shardIndex}/${count}"
                            }
                        }
                        parallel shards
                    }
                }
            }
        }
    }

    post {
        always {
            publishHTML(target: [
                allowMissing         : true,
                alwaysLinkToLastBuild: true,
                keepAll              : true,
                reportDir            : 'playwright-report',
                reportFiles          : 'index.html',
                reportName           : 'Playwright Report'
            ])
            archiveArtifacts artifacts: 'test-results/**/*',   allowEmptyArchive: true
            archiveArtifacts artifacts: 'allure-results/**/*', allowEmptyArchive: true
            cleanWs()
        }
        success {
            echo '✅ All tests passed'
        }
        failure {
            echo '❌ Tests failed — check the Playwright Report above'
        }
    }
}
