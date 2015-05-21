function getRndPass () {  
  return Math.random().toString(36).slice(2, 12);
}

function getRndLogin () {  
  return Math.random().toString().slice(2, 12);
}

$(document).ready(function() {     
  var table = $('#main_table').DataTable({
    sDom: 'T<"clear ">lfrtip',
    paging: false,
    bInfo: false,
    scrollY: 400,
    language: {
      zeroRecords: "Нет записей для отображения"
    },
    // columnDefs: [
    //   {
    //     "targets": [ 0 ],
    //     "visible": false,
    //     "searchable": false
    //   }
    // ],
    ajax: {
      url: "/rows",              
      type: "GET",
      dataSrc: ""
    },
    columns: [
      { data: 'login' },
      { data: 'password' },
      { data: '_id' },
      { data: 'status',
        render: function ( data, type, row ) {
          // If display or filter data is requested, format the status
          switch (data) {
            case 0:
              return "<span class='text-danger'>запас</span>";
              break;
            case 1:
              return "<span class='text-success'>готов</span>";
              break;                
            case 2:
              return "<span class='text-primary'>актив</span>";
              break;  
            case 3:
              return "<span class='text-danger'>истек</span>";
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
              var d = data? moment(data).format("DD.MM.YYYY"): null;
              return d;
          }
          return data;
        }
      }
    ],
    order: [ 1, 'asc' ],
    tableTools: {
      sRowSelect: "os",
      sRowSelector: 'tr',
      aButtons: []
    }
  });

  var oTT = TableTools.fnGetInstance('main_table');

  table.on( 'draw', function () {
    oTT.fnSelectNone();
  });

  $('#selectall').click(function (event) {
    oTT.fnSelectNone();
    oTT.fnSelectAll(true);
  });

  $('#deselectall').click(function (event) {
    oTT.fnSelectNone();
  });

  $('#showall').click(function (event) {
    var chb = $(this).find('input');   
    if ($(chb).prop("checked")) {
      table.ajax.url("/rows").load();
      $(chb).prop("checked", false);
    } else {
      table.ajax.url("/rows?all=true").load();
      $(chb).prop("checked", true);
    }    
  });

  $("#searchbox").on("keyup search input paste cut", function() {
     table.search(this.value).draw();
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
        var login = getRndLogin();
        var pass = getRndPass();
        var type = 'a';
        modal.find('.modal-title').text('Создание новой записи');
        modal.find('.modal-error').text('');
        modal.find('.modal-body').html('<form id="create-form">' +
          '<div class="form-group">' +
          '<label for="exampleInputName2">Логин</label>'+
          '<input type="text" class="form-control auth-data" placeholder="Логин">' +
          '</div>' +
          '<div class="form-group">' +
          '<label for="exampleInputName2">Пароль</label>'+
          '<input type="text" class="form-control auth-data" placeholder="Пароль">' +
          '</div>' +
          '<label for="exampleInputName2">Тип</label>'+
          '<div class="row">' +
          
          '<div class="col-lg-6">' +
          '<div class="form-group">' +          
          '<select class="form-control user-type" placeholder="IP">' +
            '<option value="a">ADMIN USERS</option>' +
            '<option value="s">PROXY USERS S</option>' +
            '<option value="m">PROXY USERS M</option>' +
            '<option value="l">PROXY USERS L</option>' +
            '<option value="xl">PROXY USERS XL</option>' +
            '<option value="t">TEST USERS</option>' +
          '</select>' +    
          '</div>' +
          '</div>' +
          '<div class="col-lg-6">' +
          '<div class="form-group">' + 
          '<select class="form-control user-ip" placeholder="IP">' +
            '<option value="">Создать новый IP</option>' +
          '</select>' +                     
          '</div>' +
          '</div>' +
          '</div>' +
          '<div class="checkbox">' +
          '<label><input type="checkbox"> Включить на месяц</label>' +
          '</div>' +
          '</form>');        
        modal.find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal">Чет я пеедумал, отбой.</button><button id="btn-create" type="button" class="btn btn-primary">Добавляем запись!</button>');

        modal.find('.user-type').change(function (event) {
          var select = $(this);
          type = $(event.target).find('option:selected').first().val();
          console.log(type);
          if (type !== 'a') {
            var arr = modal.find('.auth-data').prop('disabled', true);
            $(arr[0]).val(type + login);
            $(arr[1]).val(pass);
          } else modal.find('.auth-data').val('').prop('disabled', false);

          $.ajax({
            url: "/freeip?type="+type,
            method: "GET",
          }).done(function (data) {           
            var auxArr = ['<option value="">Создать новый IP</option>'];
            $.each(data, function(i, option)
            {
                auxArr[i+1] = '<option value="' + option._id + '">' + option._id + '</option>';
            });
            modal.find('.user-ip').append(auxArr.join(''));
          }).fail(function(jqXHR, textStatus, errorThrown) {
            modal.find('.modal-error').text(textStatus);
          });
        });

        $('#btn-create').click(function (event) {
          modal.find('.modal-error').text('');
          var login = $('#create-form').find('select')[0];
          var password = $('#create-form').find('input')[0];
          var ip = $('#create-form').find('input')[1];
          var flag = $('#create-form').find('input')[2];
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
          }).fail(function(jqXHR, textStatus, errorThrown) {
            modal.find('.modal-error').text(textStatus);
          });
        }); 
      break;
      case 'edit':
        modal.find('.modal-title').text('Редактирование');
        modal.find('.modal-error').text('');
        if (aData.length === 1) {
          modal.find('.modal-body').html('<form id="edit-form">' +
          '<div class="form-group">' +
          '<input type="text" class="form-control" placeholder="Логин" value="'+aData[0].login+'">' +
          '</div>' +
          '<div class="form-group">' +
          '<input type="text" class="form-control" placeholder="Пароль" value="'+aData[0].password+'">' +
          '</div>' +
          '<div class="form-group">' +
          '<input type="text" class="form-control" placeholder="IP" value="'+aData[0].ip+'">' +                          
          '</div>' +
          '<div class="row">' +
          '<div class="col-xs-6">' +
          '<div class="form-group">' +
          '<select class="form-control" placeholder="Статус">' +
            '<option value="0">запас</option>' +
            '<option value="1">готов</option>' +
            '<option value="2">актив</option>' +
            '<option value="3">истек</option>' +            
          '</select>' +  
          '</div>' +
          '</div>' +
          '<div class="col-xs-6">' +
          '<div class="form-group">' +
          '<input type="date" class="form-control" placeholder="Дата" value="'+moment(aData[0].end_date).format("YYYY-MM-DD")+'">' +                          
          '</div>' +
          '</div>' +
          '</div>'+
          '</form>');     
          modal.find('.modal-body select option').filter(function() {
            //may want to use $.trim in here
            return $(this).val() == aData[0].status; 
          }).prop('selected', true);   
          modal.find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal">Не, чет я погорячился.</button><button id="btn-edit" type="button" class="btn btn-primary" data-id="' + aData[0]._id + '">Меняем, я уверен!</button>');
          
          $('#btn-edit').click(function (event) {
            modal.find('.modal-error').text('');
            var id = $(this).data("id");
            var login = $('#edit-form').find('input')[0];
            var password = $('#edit-form').find('input')[1];
            var ip = $('#edit-form').find('input')[2];
            var status = $('#edit-form select option:selected');
            var end_date = $('#edit-form').find('input')[3];

            var data = {
              _id: id,
              login: $(login).val(),
              password: $(password).val(),
              ip: $(ip).val(),
              status: $(status).val(),
              end_date: $(end_date).val()? moment($(end_date).val()).valueOf(): null
            };

            console.log(data);
            
            $.ajax({
              url: "/rows",
              method: "PUT",
              data: data
            }).done(function() {
              modal.modal('hide');
              table.ajax.reload();
            }).fail(function(jqXHR, textStatus, errorThrown) {
              modal.find('.modal-error').text(textStatus);
            });
          });           
        } else if (aData.length > 1) {
          var idArray = [];
          for (i=0; i < aData.length; i++) {
            idArray.push(aData[i]._id);
          }
          modal.find('.modal-body').html('<form id="edit-form">' +
          '<div class="row">' +
          '<div class="col-xs-6">' +
          '<div class="form-group">' +
          '<select class="form-control" placeholder="Статус">' +
            '<option value=""></option>' +
            '<option value="0">запас</option>' +
            '<option value="1">готов</option>' +
            '<option value="2">актив</option>' +
            '<option value="3">истек</option>' +            
          '</select>' +  
          '</div>' +
          '</div>' +
          '<div class="col-xs-6">' +
          '<div class="form-group">' +
          '<input type="date" disabled class="form-control" placeholder="Дата" value="'+moment(aData[0].end_date).format("YYYY-MM-DD")+'">' +                          
          '</div>' +
          '</div>' +
          '</div>'+
          '</form>');       
          modal.find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal">Не, чет я погорячился.</button><button id="btn-edit" type="button" class="btn btn-primary">Меняем, я уверен!</button>');

          modal.find('.modal-body select').change(function () {
            $( ".modal-body select option:selected" ).each(function() {
              console.log($( this ).val());
              if ($( this ).val() == 2) {
                $( "input[type='date']" ).prop('disabled', false);
              } else {
                $( "input[type='date']" ).prop('disabled', true).val(moment(null));

              }
            });
          });

          $('#btn-edit').click(function (event) {
            modal.find('.modal-error').text('');
            var status = $('#edit-form select option:selected');
            var end_date = $('#edit-form').find("input[type='date']");

            var data = {
              _id: idArray,
              status: $(status).val()? $(status).val(): undefined,
              end_date: $(end_date).val()? moment($(end_date).val()).valueOf(): null
            };

            console.log(data);
            
            $.ajax({
              url: "/rows",
              method: "PUT",
              data: data
            }).done(function() {
              modal.modal('hide');
              table.ajax.reload();
            }).fail(function(jqXHR, textStatus, errorThrown) {
              modal.find('.modal-error').text(textStatus);
            });
          });        
        } else {
          modal.find('.modal-body').html('Нечего редактировать. Ничего не выделено...');
          modal.find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal">Ясно, понятно.</button>');
        }
      break;
      case 'delete':
        modal.find('.modal-title').text('Удаление');
        modal.find('.modal-error').text('');
        if (aData.length === 1) {
          modal.find('.modal-body').html('Братюнь, ты выделил одну запись. Уверен что нужно ее удалить?');        
          modal.find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal">Не, чет я погорячился.</button><button id="btn-delete" type="button" class="btn btn-primary" data-id="' + aData[0]._id + '">Агась, удаляем к чертям!</button>');
        } else if (aData.length > 1 && aData.length < 5) {
          modal.find('.modal-body').html('Братюнь, ты выделил ' + aData.length + ' записи. Уверен что нужно их удалить?');        
          modal.find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal">Не, чет я погорячился.</button><button id="btn-delete" type="button" class="btn btn-primary" data-id="' + aData[0]._id + '">Агась, удаляем все к чертям!</button>');
        } else if (aData.length >= 5) {
          modal.find('.modal-body').html('Братюнь, ты выделил ' + aData.length + ' записей. Уверен что нужно их удалить?');        
          modal.find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal">Не, чет я погорячился.</button><button id="btn-delete" type="button" class="btn btn-primary" data-id="' + aData[0]._id + '">Агась, удаляем все к чертям!</button>');
        } else {
          modal.find('.modal-body').html('И что тут удалять? Ничего не выделено...');
          modal.find('.modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal">Ясно, понятно.</button>');
        }
        $('#btn-delete').click(function (event) {
          modal.find('.modal-error').text('');
          // var aData = oTT.fnGetSelectedData();
          var id = $(this).data("id");            
          modal.modal('hide');
          $.ajax({
            url: "/rows",
            method: "DELETE",
            data: {_id: id}
          }).done(function() {
            table.ajax.reload();
          }).fail(function(jqXHR, textStatus, errorThrown) {
            modal.find('.modal-error').text(textStatus);
          });
        });      
      break;
    }                 
  });
  
  $('#main_table_filter').addClass('form-group');
  $('#main_table_filter').find('label').addClass('control-label');
  $('#main_table_filter').find('input').addClass('form-control');
  
}); 