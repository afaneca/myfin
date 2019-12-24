<?php
    require_once 'NotificationTemplate.php';
    
    class NewVacRequestNotification extends NotificationTemplate {
        protected $title = "Novo Pedido de Férias à espera de Aprovação!";
        
        protected $bodyForMobile = 'Novo pedido de férias de {NAME} à espera de revisão!';
        
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
                                            <td>Pedido feito por: </td>
                                            <td>{NAME}</td>
                                        </tr>
                                        <tr>
                                            <td>ID do pedido: </td>
                                            <td>{ID_VAC}</td>
                                        </tr>
                                        <tr>
                                            <td>Dias Requisitados: </td>
                                            <td>{REQUESTED_DAYS}</td>
                                        </tr>
                                        <tr>
                                            <td>Comentários: </td>
                                            <td>{COMMENTS}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </center>

                        </div>
                        <div id="action">
                            <a href="https://life.enso-origins.com/gateway.html" class="btn waves-effect waves-light btn">Ir para Enso Life</a>
                        </div>
                        <p style="text-align: justify; padding: 10">Está a receber esta notificação porque se encontra registado para
                            esse efeito em <a href="https://life.enso-origins.com">life.enso-origins.com</a>. Contacte um administrador
                            se tiver qualquer questão.</p>
                    </div>

                </body>

                </html>
        ';

        private function getRequestedDays($reqDays){
            $str = "[ ";


            foreach($reqDays as $i => $day){
                $formattedDate = gmdate("d-m-Y", $day);
                if($i !== count($reqDays) - 1) // se não for o último elemento da lista
                    $str .= "$formattedDate, ";
                else
                    $str .= "$formattedDate ]";
            }

            return $str;
        }

        public function getBodyForMobile($args){
            if($args['name']) $name = $args['name'];
            else $name = 'Desconhecido';

            $temp = str_replace("{NAME}", $name, $this->bodyForMobile);
            /* $temp = str_replace("{NAME}", $name, $temp); */

            return $temp;
        }

        public function getBodyForHTMLMail($args){
            if($args['name']) $name = $args['name'];
            else $name = 'Desconhecido';

            if($args['requested_days'])
                $requestedDays = $this->getRequestedDays($args['requested_days']);
            else $requestedDays = 'Desconhecido';

            if($args['comments']) $comments = $args['comments'];
            else $comments = 'Desconhecido';

            if($args['id_vac']) $idVac = $args['id_vac'];
            else $idVac = 'Desconhecido';

            $temp = str_replace("{NAME}", $name, $this->bodyForHTMLMail);
            $temp = str_replace("{NOTIFICATION_TYPE}", "Novo Pedido de Férias", $temp);
            $temp = str_replace("{REQUESTED_DAYS}", $requestedDays, $temp);
            $temp = str_replace("{COMMENTS}", $comments, $temp);
            $temp = str_replace("{ID_VAC}", $idVac, $temp);

            return $temp;
        }

        
    }