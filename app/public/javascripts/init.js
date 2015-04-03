$(document).ready(function() {     
    var table = $('#main_table').DataTable({
      sDom: 'T<"clear ">lfrtip',
      paging: false,
      scrollY: 400,
      columnDefs: [
        {
          "targets": [ 0 ],
          "visible": false,
          "searchable": false
        }
      ],
      ajax: {
        url: "/rows",              
        type: "GET",
        dataSrc: ""
      },
      columns: [
        { data: '_id' },
        { data: 'login' },
        { data: 'password' },
        { data: 'ip' },
        { data: 'status',
          render: function ( data, type, row ) {
            // If display or filter data is requested, format the status
            switch (data) {
              case 0:
                return "<span class='text-danger'>истек</span>";
                break;
              case 1:
                return "<span class='text-success'>готов</span>";
                break;                
              case 2:
                return "<span class='text-primary'>актив</span>";
                break;                
            }
            if ( type === 'display' || type === 'filter' ) {
                var d = moment(data);
                return d.format("DD.MM.YYYY (HH:mm)");
            }
            return data;
          }
        },
        { 
          data: 'end_date',
          render: function ( data, type, row ) {
            // If display or filter data is requested, format the date
            if ( type === 'display' || type === 'filter' ) {
                var d = moment(data);
                return d.format("DD.MM.YYYY (HH:mm)");
            }
            return data;
          }
        }
      ],
      order: [ 1, 'asc' ],
      tableTools: {
        sRowSelect: "single",
        sRowSelector: 'tr',
        aButtons: []
      }
    });
    
    $('#myModal').on('hidden.bs.modal', function (event) {
      var modal = $(this);
      modal.find('.modal-title').text('');
      modal.find('.modal-body').html('');        
      modal.find('.modal-footer').html('');
    });

    $('#myModal').on('show.bs.modal', function (event) {
      var aData = oTT.fnGetSelectedData();
      var button = $(event.relatedTarget); // Button that triggered the modal
      var type = button.data('whatever'); // Extract info from data-* attributes
      var modal = $(this);

      switch (type) {
        case 'create':
          var modal = $(this);
          modal.find('.modal-title').text('Создание новой записи');
          modal.find('.modal-body').html('<form id="create-form">' +
            '<div class="form-group">' + 
            '<input type="text" class="form-control" placeholder="Логин">' +
            '</div>' +
            '<div class="form-group">' +
            '<input type="text" class="form-control" placeholder="Пароль">' +
            '</div>' +
            '<div class="form-group">' +
            '<input type="text" class="form-control"placeholder="IP">' +                          
            '</div>' +
            '<div class="checkbox">' +
            '<label><input type="checkbox"> Включить на месяц</label>' +
            '</div>' +
            '</form>');        
          modal.find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal">Чет я пеедумал, отбой.</button><button id="btn-create" type="button" class="btn btn-primary">Добавляем запись!</button>');


          $('#btn-create').click(function (event) {
            var login = $('#create-form').find('input')[0];
            var password = $('#create-form').find('input')[1];
            var ip = $('#create-form').find('input')[2];
            var flag = $('#create-form').find('input')[3];
            var end_date = $(flag).prop("checked")? (new Date().getTime()) + (30 * 24 * 60 * 60 * 1000): null;
            var status = $(flag).prop("checked")? 2: 1;

            var data = {
              login: $(login).val(),
              password: $(password).val(),
              ip: $(ip).val(),
              status: status,
              end_date: end_date
            };

            console.log(data);
            
            $.ajax({
              url: "/rows",
              method: "POST",
              data: data
            }).done(function() {
              modal.modal('hide');
              table.ajax.reload();
            });
          }); 
        break;
        case 'edit':

        break;
        case 'delete':
          modal.find('.modal-title').text('Удаление');
          if (aData.length > 0) {
            modal.find('.modal-body').html('Братюнь, ты выделил одну запись. Уверен что нужно ее удалить?');        
            modal.find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal">Не, чет я погорячился.</button><button id="btn-delete" type="button" class="btn btn-primary" data-id="' + aData[0]._id + '">Агась, удаляем к чертям!</button>');
          } else {
            modal.find('.modal-body').html('И что тут удалять? Ничего не выделено...');
            modal.find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal">Ясно, понятно.</button>');
          }
          $('#btn-delete').click(function (event) {
            var aData = oTT.fnGetSelectedData();
            var id = $(this).data("id");            
            modal.modal('hide');
            $.ajax({
              url: "/rows",
              method: "DELETE",
              data: {_id: id}
            }).done(function() {
              table.ajax.reload();
            });
          });      
        break;
      }                 
    });

    var oTT = TableTools.fnGetInstance('main_table');
    $('#main_table_filter label input:text').addClass('form-control input-lg col-xs-6');
  }); 