<?php
    require_once 'NotificationTemplate.php';
    
    class VacReqsListingNotification extends NotificationTemplate {
        protected $title = "Nova listagem de pedidos de férias disponível!";
        
        protected $bodyForMobile = 'Nova listagem de pedidos de férias disponível!';
        
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

                        li {
                            list-style-position: inside
                        }

                        ul>li {
                            margin-left: 10px;
                        }

                        .main-content {
                            text-align: center;
                            width: 30%;
                            margin: 0 auto;
                            margin-bottom: 60px !important;
                        }

                        .username {
                            font-size: 20px;
                            font-weight: bold;
                        }
                    </style>
                </head>

                <body>
                    <div id="main-Wrapper">
                        <img class="logo" src="https://life.enso-origins.com/web/img/logo.png">
                        <h1></h1>
                        <div id="data-table">
                            <table>
                                <tbody>
                                    <tr>
                                        Abaixo segue a lista detalhada que requisitou:
                                    </tr>
                                </tbody>
                            </table>
                            <div class="main-content">
                                {VACS_LIST}
                            </div>


                        </div>
                        <div id=" action">
                            <a href="https://life.enso-origins.com/gateway.html" class="btn waves-effect waves-light btn">Ir para Enso
                                Life</a>
                        </div>
                        <p style="text-align: justify; padding: 10">Está a receber esta notificação porque se encontra registado para
                            esse efeito em <a href="https://life.enso-origins.com">life.enso-origins.com</a>. Contacte um administrador
                            se tiver qualquer questão.</p>
                    </div>

                </body>

                </html>
        ';

        public function getBodyForMobile($args){
            if($args['name']) $name = $args['name'];
            else $name = 'Desconhecido';

            $temp = str_replace("{NAME}", $name, $this->bodyForMobile);
            /* $temp = str_replace("{NAME}", $name, $temp); */

            return $temp;
        }

        public function getBodyForHTMLMail($args){
            if($args['VACS_LIST']) $vacsList = $args['VACS_LIST'];
            else $vacsList = 'Desconhecido';

            $temp = str_replace("{VACS_LIST}", $vacsList, $this->bodyForHTMLMail);

            return $temp;
        }

        
    }