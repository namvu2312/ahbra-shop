document.addEventListener('DOMContentLoaded', () => {
  // QUAN TRỌNG: Thay thế bằng cấu hình dự án Firebase của bạn
  const firebaseConfig = {
    apiKey: "AIzaSyBw9POG8Ug1e_RIK5wrhaFtsT9Y96NKTUI",
    authDomain: "ahbra-shop.firebaseapp.com",
    projectId: "ahbra-shop",
    storageBucket: "ahbra-shop.firebasestorage.app",
    messagingSenderId: "131410832977",
    appId: "1:131410832977:web:af9ccf1bab2a7bc0411270"
  };

  // Khởi tạo Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Khởi tạo các dịch vụ Firebase
  const db = firebase.firestore();

  // ==================================================
  //        KHAI BÁO BIẾN VÀ LẤY DOM ELEMENTS
  // ==================================================
  const productGridContainer = document.getElementById('product-grid-container');
  const cartCountElement = document.getElementById('cart-count');

  // ==================================================
  //        LOGIC QUẢN LÝ GIỎ HÀNG (LOCALSTORAGE)
  // ==================================================

  /**
   * Cập nhật số lượng hiển thị trên icon giỏ hàng.
   * Tính tổng số lượng (quantity) của tất cả sản phẩm trong giỏ.
   */
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Tính tổng số lượng của tất cả các mặt hàng
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
      cartCountElement.textContent = totalItems;
    }
  };

  /**
   * Thêm một sản phẩm vào giỏ hàng hoặc cập nhật số lượng nếu đã tồn tại.
   * @param {object} product - Đối tượng sản phẩm {id, name, price, image}
   */
  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Tìm xem sản phẩm đã có trong giỏ hàng chưa
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
      // Nếu đã có, tăng số lượng lên 1
      cart[existingProductIndex].quantity += 1;
    } else {
      // Nếu chưa có, thêm sản phẩm mới vào giỏ với số lượng là 1
      product.quantity = 1;
      cart.push(product);
    }
    
    // Lưu giỏ hàng đã cập nhật trở lại localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Cập nhật lại số hiển thị trên icon
    updateCartCount();

    // (Tùy chọn) Hiển thị thông báo cho người dùng
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  // ==================================================
  //        LOGIC TẢI VÀ HIỂN THỊ SẢN PHẨM
  // ==================================================

  const fetchProducts = () => {
    if (!productGridContainer) {
      console.error("Không tìm thấy phần tử 'product-grid-container'.");
      return;
    }
    productGridContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Đang tải sản phẩm...</p>';

    db.collection('products').orderBy('createdAt', 'desc')
      .onSnapshot((querySnapshot) => {
        productGridContainer.innerHTML = ''; 
        if (querySnapshot.empty) {
          productGridContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Hiện chưa có sản phẩm nào.</p>';
          return;
        }

        querySnapshot.forEach(doc => {
          const product = doc.data();
          const formattedPrice = product.price.toLocaleString('vi-VN');

          // Tạo HTML cho mỗi thẻ sản phẩm, bao gồm cả nút "Thêm vào giỏ"
          const productCardHTML = `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.imageUrl}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="sale-price">${formattedPrice} VND</span>
                    </div>
                    <button 
                        class="add-to-cart-btn"
                        data-id="${doc.id}"
                        data-name="${product.name}"
                        data-price="${product.price}"
                        data-image="${product.imageUrl}"
                    >
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
          `;
          productGridContainer.innerHTML += productCardHTML;
        });

      }, (error) => {
        console.error("Lỗi khi tải sản phẩm: ", error);
        productGridContainer.innerHTML = '<p style="text-align: center; color: red; grid-column: 1 / -1;">Đã xảy ra lỗi khi tải sản phẩm. Vui lòng thử lại sau.</p>';
      });
  };

  // ==================================================
  //        GẮN CÁC TRÌNH LẮNG NGHE SỰ KIỆN
  // ==================================================
  
  /**
   * Sử dụng event delegation để xử lý hiệu quả các sự kiện click
   * trên các nút "Thêm vào giỏ" được tạo động.
   */
  productGridContainer.addEventListener('click', (event) => {
    // Chỉ thực hiện hành động nếu phần tử được nhấp có class 'add-to-cart-btn'
    if (event.target.classList.contains('add-to-cart-btn')) {
      const button = event.target;
      // Tạo đối tượng sản phẩm từ data attributes của nút
      const product = {
        id: button.dataset.id,
        name: button.dataset.name,
        price: Number(button.dataset.price), // Chuyển giá về dạng số
        image: button.dataset.image
      };
      // Gọi hàm để thêm sản phẩm vào giỏ hàng
      addToCart(product);
    }
  });


  // ==================================================
  //        KHỞI TẠO KHI TẢI TRANG
  // ==================================================
  fetchProducts();
  updateCartCount(); // Cập nhật số lượng giỏ hàng ngay khi tải trang
});
