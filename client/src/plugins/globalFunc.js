// export default {
    // getStatusColor(status) {
    //     switch (status) {
    //       case 'default':
    //       case 'not_contacted':
    //         return 'grey'
    //         break;
    //       case 'in progress':
    //       case 'contacted':
    //         return 'blue'
    //         break;
    //       case 'rejected':
    //       case 'refused':
    //         return 'red'
    //         break;
    //       case 'warning':
    //       case 'various':
    //         return 'orange'
    //         break;
    //       case 'review':
    //       case 'approved':
    //         return 'green'
    //         break;        
    //       default:
    //         return 'grey'
    //         break;
    //     }
    //   },
// }
export default {
  install: (app, options) => {
    // inject a globally available $translate() method
    app.config.globalProperties.$getStatusColor = (options) => {
      switch (options) {
        case 'default':
        case 'not_contacted':
          return 'grey'
          break;
        case 'in progress':
        case 'contacted':
          return 'blue'
          break;
        case 'rejected':
        case 'refused':
        case 'blocked':
        case 'forbidden':
          return 'red'
          break;
        case 'warning':
        case 'various':
          return 'orange'
          break;
        case 'review':
        case 'approved':
        case 'allowed':
        case 'success':  
          return 'green'
          break;        
        default:
          return 'grey'
          break;
      }
    }
    app.config.globalProperties.$formatDateEn = (date) => {
      var monthsArr = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ];
      date = new Date(date);
      const dd = (date.getDate() < 10 ? "0" : "") + date.getDate();
      const MM = monthsArr[date.getMonth()];
      const yyyy = date.getFullYear();
      const h = date.getHours();
      const min = date.getMinutes()
      return dd + " " + MM + " " + yyyy + " / " + h + ":" + min;
    }
  }
}