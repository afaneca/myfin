"use strict";

var tableUtils = {
    setupStaticTable: (tableID, onDrawCallback) => {
        $(tableID).DataTable({
            "order": [[0, "desc"]], 
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
                }},
                drawCallback: function() {onDrawCallback},
        })
    },
    setupStaticTableWithCustomColumnWidths: (tableID, customColumnWidths, onDrawCallback) => {
        $(tableID).DataTable({
            "order": [[0, "desc"]],
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
            },
            drawCallback: function () { onDrawCallback },
        })
    }
}

//# sourceURL=js/utils/tableUtils.js