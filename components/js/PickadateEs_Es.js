jQuery.extend( jQuery.fn.pickadate.defaults, {
    monthsFull: [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ],
    monthsShort: [ 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic' ],
    weekdaysFull: [ 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ],
    weekdaysShort: [ 'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb' ],
    weekdaysLetter: [ 'D', 'L', 'M', 'M', 'J', 'V', 'S' ],
    labelMonthNext: 'Siguiente Mes',
    labelMonthPrev: 'Anterior Mes',
    labelMonthSelect: 'Seleccione Mes',
    labelYearSelect: 'Seleccione Año',

    format: ' dd mmm, yyyy',
    formatSubmit: 'yyyy/mm/dd',
});

jQuery.extend( jQuery.fn.pickatime.defaults, {
    clear: 'borrar'
});