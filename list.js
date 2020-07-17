//IIFE
(function () {
  const modalTitle = document.querySelector('.modal-title')
  const modalFooter = document.querySelector('.modal-footer')
  const modalBody = document.querySelector('.modal-body')
  const dataPanel = document.querySelector('#data-panel')
  const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
  const INDEX_URL = BASE_URL + '/api/v1/users/'
  const searchBar = document.querySelector('#search-bar')
  const searchInput = document.getElementById('search-input')
  const pagiNation = document.querySelector('#pagination')
  const iCON = document.querySelector('.icon')
  let mode = 1  // 2 = favorite list  1 = 一般list
  let fav_page = 1　//宣告一個pagenumber給favoritelist　存在global
  const data = []  //將api資料放進data　是存在global區域
  const startpage = 1

  axios
    .get(INDEX_URL)  //人物API
    .then((response) => {
      console.log(response.data.results) //check 看結果
      data.push(...response.data.results)//object
      pageData(startpage, data)  //1代表初始頁數
      totalPages(data, startpage)
    })
    .catch((err) => {
      console.log("err")
    })

  function removeFavoriteItem(id, data) {

    const index = data.findIndex(item => item.id === Number(id))
    if (index === -1) return
    // remove movie and update localStorage
    data.splice(index, 1)
    localStorage.setItem('favoritePPL', JSON.stringify(data))
    // repaint dataList

    if (data.length <= (fav_page - 1) * 20) {  //當刪除某一data時　頁數也減少的狀況
      pageData(fav_page - 1, data)
      totalPages(data, fav_page - 1)
    } else {
      pageData(fav_page, data)
    }
  }  //刪除資料from favorite list



  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoritePPL')) || [] //取出電影
    const people = data.find(item => item.id === Number(id))   //單一人物

    if (list.some(item => item.id === Number(id))) {   //some函式為了檢查人物是否重複
      alert(`${people.name} is already in your favorite list.`)
    } else {
      list.push(people)
      alert(`Added ${people.name} to your favorite list!`)
    }
    localStorage.setItem('favoritePPL', JSON.stringify(list))
  }  //加入favorite list
  //將人物資料display出來
  function displayDataList(data) {
    let htmlContent = ''
    data.forEach(function (item, index) {    //顯示網頁之函數
      htmlContent +=
        `
       <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top" src="${item.avatar}" alt="Card image cap" data-toggle="modal" data-target="#exampleModalCenter" data-id="${item.id}">
            <div class="card-body movie-item-body">
              <h5 class="card-title">${item.name} ${item.surname} </h5>
            </div>

            <!-- "More" button -->     
            <div class="card-footer">
              <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModalCenter" data-id="${item.id}">
  More Info
</button>
            </div>
          </div>
        </div>
       `
    })
    dataPanel.innerHTML = htmlContent
  }  //顯示data 人物資料 大項

  function displayInfo(ID) {
    const URL = INDEX_URL + ID  //針對個人ID的API
    console.log(URL)
    let displayInfo = ''
    let closeFav = ''
    axios
      .get(URL)
      .then((response) => {
        console.log(response)   //check 資料型態與長相
        const data = response.data   //此data僅存在於displayInfo這個local域裡面
        const Modal_name = `${data.name} ${data.surname} `    //顯示名字
        closeFav = `
      <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      <button class="btn btn-danger btn-add-favorite-modal" data-id="${data.id}">♡</button>
`
        displayInfo = `    
      <img src = "${data.avatar}">          
      <div>Age: ${data.age}</div>
      <div>Gender: ${data.gender}</div>
      <div>Region: ${data.region}</div>
      <div>Birthday: ${data.birthday}</div>
       `
        modalBody.innerHTML = displayInfo
        modalTitle.innerText = Modal_name
        modalFooter.innerHTML = closeFav //close鍵與愛心
      })
      .catch(err => {
        console.log("error")
      })
  }  //顯示細節資料

  function displayFav(data) {
    let htmlContent = ''
    data.forEach(function (item, index) {    //顯示網頁之函數
      htmlContent +=
        `
       <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top" src="${item.avatar}" alt="Card image cap" data-toggle="modal" data-target="#exampleModalCenter" data-id="${item.id}">
            <div class="card-body movie-item-body">
              <h5 class="card-title">${item.name} ${item.surname} </h5>
            </div>

            <!-- "More" button -->     
            <div class="card-footer cross">
              <button class="btn btn-info cross" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
       `
    })
    dataPanel.innerHTML = htmlContent
  } //顯fav list的資料

  function addActive(currentPage) {
    const allPages = document.querySelectorAll(".page-item")
    allPages.forEach(page => {
      page.classList.remove("active")    //先將前一次active的頁數去除底色去掉active
      if (Number(page.firstElementChild.dataset.page) === currentPage) { //li標籤內page等同於current page時加入active
        page.classList.add('active')
      }
    })
  }  //使頁數變active有底色

  function totalPages(data, currentpage) {
    let totalpages = Math.ceil(data.length / 20) //一頁要20筆
    console.log(totalpages) //check point
    let pageContent = ''
    for (let i = 1; i <= totalpages; i++) {
      if (currentpage === i) {  //當currentpage時　使用active
        pageContent += `
      <li class="page-item active">
        <a class="page-link" href="javascript:;" data-page="${i}"> ${i} </a>
      </li>
    `
      } else {
        pageContent += `
      <li class="page-item">
        <a class="page-link" href="javascript:;" data-page="${i}"> ${i} </a>
      </li>
    `
      }
    }
    pagiNation.innerHTML = pageContent
  }  //總共的頁數

  let paginationData = []

  function pageData(pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * 20 //當頁的第一筆資料所在data的index數
    let pageData = paginationData.slice(offset, (offset + 20))// 擷取出當頁的20筆資料
    if (mode === 1) {
      displayDataList(pageData)
    } if (mode === 2) {
      displayFav(pageData)
    }

  }  //取得當頁的資料

  iCON.addEventListener('click', (event) => {
    let genderData = []
    mode = 1
    if (event.target.matches('.male')) {
      genderData = data.filter(male => male.gender === "male");  //男生
    } if (event.target.matches('.female')) {
      genderData = data.filter(female => female.gender === "female");  //女生
    } if (event.target.matches('.venus-mars')) {  //全部人
      genderData = data  //此處data是global區域的
    }
    console.log(genderData)
    pageData(1, genderData)  //初始都是第一頁的資料
    totalPages(genderData, 1)  //全部頁數
  })  //此監聽器做為filter用

  iCON.addEventListener('click', (event) => {
    console.log(event.target)
    if (event.target.matches('.favorite-list')) {
      mode = 2
      const list = JSON.parse(localStorage.getItem('favoritePPL'))  //這邊的data是favorite list中的人
      pageData(1, list)  //初始都是第一頁的資料
      totalPages(list, 1)   //將favorite list的人render出來
    }
  }) //此監聽器是顯示fav list

  modalFooter.addEventListener('click', (event) => {
    if (event.target.matches('.btn-danger')) {
      addFavoriteItem(event.target.dataset.id)
    }
  }) //加入favorite list

  dataPanel.addEventListener('click', (event) => {    //事件監聽器 只對more info產生反應
    if (event.target.matches('.btn-primary') || event.target.matches('.card-img-top')) {
      displayInfo(event.target.dataset.id)
    }
  })  //more info上的監聽器

  dataPanel.addEventListener('click', (event) => {
    const data = JSON.parse(localStorage.getItem('favoritePPL'))  //這邊的data為favorite ppl list
    if (event.target.matches('.cross')) {  //點到刪除鍵
      removeFavoriteItem(event.target.dataset.id, data)
    }
  }) //刪除favorite list上的監聽器


  searchBar.addEventListener('submit', event => {
    event.preventDefault()
    let results = []
    const regex = new RegExp(searchInput.value, 'i')
    results = data.filter(item => item.name.match(regex) || item.surname.match(regex) || item.region.match(regex)) //可搜尋名字與地區
    pageData(1, results)
    totalPages(results)
  })


  pagiNation.addEventListener('click', event => {   //點擊想看的所在頁數
    const allPages = document.querySelectorAll(".page-item")
    allPages.forEach((page) => {
      page.classList.remove("active")
    })  //將所有active洗掉
    const targetpage = event.target.dataset.page
    event.target.parentElement.classList.add('active')  //當下點擊的所在頁數變成active

    //以下做為取得點擊頁面 後取得的資料
    if (event.target.tagName === "A") { // 當選到標籤時
      if (mode === 2) {
        fav_page = targetpage
        pageData(fav_page)
      } else {
        pageData(targetpage)
      }
    }
  })
})()
