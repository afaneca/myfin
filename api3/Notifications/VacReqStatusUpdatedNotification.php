<?php
    require_once 'NotificationTemplate.php';
    
    class VacReqStatusUpdatedNotification extends NotificationTemplate {
        protected $title = "O estado de um dos seus pedidos de férias foi atualizado!";
        
        protected $bodyForMobile = 'O seu pedido de férias foi {NEW_STATUS}!';
        
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
                        #data-table  {
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

                        .btn:hover{
                            background-color: #060606;
                            transition: 0.5s;
                        }

                        tr {
                            padding: 10px
                        }
                        td{ padding: 10px }
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
                                            <td>Pedido respondido por: </td>
                                            <td>{NAME}</td>
                                        </tr>
                                        <tr>
                                            <td>ID do pedido: </td>
                                            <td>{ID_VAC}</td>
                                        </tr>
                                        <tr>
                                            <td>Comentário do pedido: </td>
                                            <td>{COMMENTS}</td>
                                        </tr>
                                        <tr>
                                            <td>Estado: </td>
                                            <td>{NEW_STATUS}</td>
                                        </tr>
                                        <tr>
                                            <td>Condição: </td>
                                            <td>{VAC_CONDITION}</td>
                                        </tr>
                                    </tbody>
                                </table>
                        </center>
                            
                        </div>
                        <div id="action">
                            <a href="https://life.enso-origins.com/gateway.html" class="btn waves-effect waves-light btn">Ir para Enso Life</a>
                        </div>
                        <p style="text-align: justify; padding: 10">Está a receber esta notificação porque se encontra registado para esse efeito em <a href="https://life.enso-origins.com">life.enso-origins.com</a>. Contacte um administrador se tiver qualquer questão.</p>
                    </div>
                    
                </body>
            </html>
        ';


        public function getBodyForMobile($args){
            if($args['new_status']) $newStatus = $args['new_status'];
            else $newStatus = 'respondido';

            $temp = str_replace("{NEW_STATUS}", $newStatus, $this->bodyForMobile);

            return $temp;
        }

        public function getBodyForHTMLMail($args){
            if($args['new_status']) $newStatus = $args['new_status'];
            else $newStatus = 'respondido';

            if($args['name']) $name = $args['name'];
            else $name = 'Desconhecido';
            if($args['comments']) $comments = $args['comments'];
            else $comments = 'Desconhecido';

            if($args['id_vac']) $idVac = $args['id_vac'];
            else $idVac = 'Desconhecido';

            if($newStatus == "Aprovado"){
                if($args['vac_condition']) $vacCondition = $args['vac_condition'];
                else $vacCondition = "Férias";
            
            }else $vacCondition = 'Não se aplica';
            

            $temp = str_replace("{NAME}", $name, $this->bodyForHTMLMail);
            $temp = str_replace("{NOTIFICATION_TYPE}", "Resposta ao seu pedido de férias", $temp);
            $temp = str_replace("{NEW_STATUS}", $newStatus, $temp);
            $temp = str_replace("{VAC_CONDITION}", $vacCondition, $temp);
            $temp = str_replace("{ID_VAC}", $idVac, $temp);
            $temp = str_replace("{COMMENTS}", $comments, $temp);

            return $temp;
        }

        
    }