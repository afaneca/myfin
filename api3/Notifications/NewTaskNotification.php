<?php
    require_once 'NotificationTemplate.php';
    
    class NewTaskNotification extends NotificationTemplate {
        protected $title = "Foi adicionada uma nova tarefa ao seu horário!";
        
        protected $bodyForMobile = 'Foi adicionada uma nova tarefa ao seu horário!';
        
        protected $bodyForHTMLMail = '
            <html>
                <head>
                    <style>
                        #main-Wrapper {
                            margin: 0 auto;
                            width: 80%;
                            background: rgb(242, 242, 242) !important;
                            border-radius: 10px;
                            min-height: 200px;
                            text-align: center;
                        }

                        #data-table {
                            margin: 20px;
                        }

                        #action {
                            padding: 40px;
                            padding: 20px;
                        }

                        .logo {
                            max-width: 15%;
                            margin: 20px;
                        }

                        .btn {
                            background-color: #063f57;
                            border-radius: 10px;
                            padding: 10px;
                            color: white !important;
                            text-decoration: none;
                        }

                        .btn:hover {
                            background-color: #060606;
                            transition: 0.5s;
                        }

                        tr {
                            padding: 10px
                        }

                        td {
                            padding: 10px
                        }
                    </style>
                </head>

                <body>
                    <div id="main-Wrapper">
                        <img class="logo" src="https://life.enso-origins.com/web/img/logo.png">
                        <h1></h1>
                        <div id="data-table">
                            <center>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Tipo de Notificação: </td>
                                            <td>{NOTIFICATION_TYPE}</td>
                                        </tr>
                                        <tr>
                                            <td>Tarefa adicionada por: </td>
                                            <td>{TASK_ADDED_BY_NAME}</td>
                                        </tr>
                                        <tr>
                                            <td>ID da Tarefa: </td>
                                            <td>{ID_TASK}</td>
                                        </tr>
                                        <tr>
                                            <td>Descrição: </td>
                                            <td>{TASK_DESCRIPTION}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </center>

                        </div>
                        <div id="action">
                            <a href="https://life.enso-origins.com/gateway.html" class="btn waves-effect waves-light btn">Ir para Enso Life</a>
                        </div>
                        <p style="text-align: justify; padding: 10">Está a receber esta notificação porque se encontra registado para
                            esse efeito em <a href="https://life.enso-origins.com/">life.enso-origins.com</a>. Contacte um administrador
                            se tiver qualquer questão.</p>
                    </div>

                </body>

                </html>
        ';


        public function getBodyForMobile($args){
            /* if($args['name']) $name = $args['name'];
            else $name = 'Desconhecido'; */

            /* $temp = str_replace("{NAME}", $name, $this->bodyForMobile); */
            /* $temp = str_replace("{NAME}", $name, $temp); */
            $temp = $this->bodyForMobile;
            return $temp;
        }

        public function getBodyForHTMLMail($args){
            if($args['task_added_by_name']) $taskAddedByName = $args['task_added_by_name'];
            else $taskAddedByName = 'Desconhecido';

            if($args['task_description'])
                $taskDescription = $args['task_description'];
            else $taskDescription = 'Desconhecido';

            if($args['id_task']) $idTask = $args['id_task'];
            else $idTask = 'Desconhecido';

            $temp = str_replace("{TASK_ADDED_BY_NAME}", $taskAddedByName, $this->bodyForHTMLMail);
            $temp = str_replace("{NOTIFICATION_TYPE}", "Nova tarefa adicionada ao seu horário!", $temp);
            $temp = str_replace("{TASK_DESCRIPTION}", $taskDescription, $temp);
            $temp = str_replace("{ID_TASK}", $idTask, $temp);

            return $temp;
        }

        
    }