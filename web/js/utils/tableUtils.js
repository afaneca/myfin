"use strict";

var tableUtils = {
    setupStaticTable: (tableID) => {
        $(tableID).DataTable({
            "lengthChange": false,
            "pageLength": 50,
            "language": {
                "lengthMenu": "A mostrar _MENU_ registos por página",
                "zeroRecords": "Nenhum registo encontrado",
                "info": "A mostrar a página _PAGE_ de _PAGES_",
                "infoEmpty": "Nenhum registo encontrado",
                "infoFiltered": "(filtrado de um total de _MAX_ registos)",
                "search": "Pesquisa:",
                "paginate": {
                    "next": "Página Seguinte",
                    "previous": "Página Anterior",
                }
            }
        })
    },
    setupStaticTableWithCustomColumnWidths: (tableID, customColumnWidths) => {
        $(tableID).DataTable({
            "lengthChange": false,
            "pageLength": 50,
            "columnDefs": customColumnWidths,
            "language": {
                "lengthMenu": "A mostrar _MENU_ registos por página",
                "zeroRecords": "Nenhum registo encontrado",
                "info": "A mostrar a página _PAGE_ de _PAGES_",
                "infoEmpty": "Nenhum registo encontrado",
                "infoFiltered": "(filtrado de um total de _MAX_ registos)",
                "search": "Pesquisa:",
                "paginate": {
                    "next": "Página Seguinte",
                    "previous": "Página Anterior",
                }
            }
        })
    }
}

//# sourceURL=js/utils/tableUtils.js