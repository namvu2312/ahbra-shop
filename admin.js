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
  const storage = firebase.storage();

  // ================================== //
  //        LOGIC QUẢN LÝ SẢN PHẨM      //
  // ================================== //

  const addProductForm = document.getElementById('add-product-form');
  const productNameInput = document.getElementById('product-name');
  const productPriceInput = document.getElementById('product-price');
  const productImageInput = document.getElementById('product-image');
  const productListContainer = document.getElementById('product-list-container');
  const addProductBtn = document.getElementById('add-product-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const progressContainer = document.getElementById('upload-progress-container');
  const progressBar = document.getElementById('upload-progress-bar');


  // --- Logic Thêm Sản phẩm ---
  const handleProductSubmit = (e) => {
    e.preventDefault();
    const name = productNameInput.value;
    const price = Number(productPriceInput.value);
    const imageFile = productImageInput.files[0];

    if (!name || price <= 0 || !imageFile) {
      alert('Vui lòng điền đầy đủ thông tin và chọn hình ảnh.');
      return;
    }

    // Vô hiệu hóa nút và hiển thị spinner
    addProductBtn.disabled = true;
    btnText.textContent = 'Đang xử lý...';
    btnSpinner.classList.remove('hidden');
    progressContainer.classList.remove('hidden');

    // 1. Tải ảnh lên Firebase Storage
    const storageRef = storage.ref(`product_images/${Date.now()}_${imageFile.name}`);
    const uploadTask = storageRef.put(imageFile);

    // Lắng nghe sự kiện thay đổi trạng thái upload để hiển thị progress bar
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.style.width = progress + '%';
      }, 
      (error) => {
        console.error("Lỗi tải ảnh lên: ", error);
        alert('Có lỗi xảy ra khi tải ảnh lên!');
        // Reset nút
        addProductBtn.disabled = false;
        btnText.textContent = 'Thêm sản phẩm';
        btnSpinner.classList.add('hidden');
        progressContainer.classList.add('hidden');
      }, 
      () => {
        // 2. Lấy URL của ảnh và lưu vào Firestore
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          db.collection('products').add({
            name: name,
            price: price,
            imageUrl: downloadURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          }).then(() => {
            console.log('Sản phẩm đã được thêm thành công!');
            addProductForm.reset();
          }).catch((error) => {
            console.error("Lỗi khi thêm sản phẩm vào Firestore: ", error);
          }).finally(() => {
            // Reset nút và progress bar
            addProductBtn.disabled = false;
            btnText.textContent = 'Thêm sản phẩm';
            btnSpinner.classList.add('hidden');
            progressContainer.classList.add('hidden');
            progressBar.style.width = '0%';
          });
        });
      }
    );
  };

  // --- Logic Hiển thị Sản phẩm ---
  const fetchProducts = () => {
    db.collection('products').orderBy('createdAt', 'desc').onSnapshot((querySnapshot) => {
      if (querySnapshot.empty) {
        productListContainer.innerHTML = '<p class="text-gray-500">Chưa có sản phẩm nào.</p>';
        return;
      }
      
      let productsHTML = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">';
      querySnapshot.forEach(doc => {
        const product = doc.data();
        productsHTML += `
          <div class="border rounded-lg overflow-hidden shadow-lg bg-white">
            <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-4">
              <h3 class="font-bold text-lg text-gray-800">${product.name}</h3>
              <p class="text-gray-600 mt-1">${product.price.toLocaleString('vi-VN')} VND</p>
              <button data-id="${doc.id}" data-image-url="${product.imageUrl}" class="delete-btn mt-4 btn btn-danger btn-sm">Xóa</button>
            </div>
          </div>
        `;
      });
      productsHTML += '</div>';
      productListContainer.innerHTML = productsHTML;
    });
  };

  // --- Logic Xóa Sản phẩm (Sử dụng Event Delegation) ---
  const handleProductListClick = (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const productId = e.target.dataset.id;
      const imageUrl = e.target.dataset.imageUrl;

      if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.')) {
        // 1. Xóa document trong Firestore
        db.collection('products').doc(productId).delete().then(() => {
          console.log('Sản phẩm đã được xóa khỏi Firestore.');
          // 2. Xóa file ảnh trong Storage
          const imageRef = storage.refFromURL(imageUrl);
          imageRef.delete().then(() => {
            console.log('Ảnh sản phẩm đã được xóa khỏi Storage.');
          }).catch(error => {
            console.error("Lỗi khi xóa ảnh trong Storage: ", error);
          });
        }).catch(error => {
          console.error("Lỗi khi xóa sản phẩm trong Firestore: ", error);
        });
      }
    }
  };


  // Gắn các trình lắng nghe sự kiện
  addProductForm.addEventListener('submit', handleProductSubmit);
  productListContainer.addEventListener('click', handleProductListClick);


  // ================================== //
  //        LOGIC QUẢN LÝ ĐƠN HÀNG       //
  // ================================== //

  const orderListBody = document.getElementById('order-list-body');

  const fetchOrders = () => {
    db.collection('orders').orderBy('createdAt', 'desc').onSnapshot((querySnapshot) => {
      if (querySnapshot.empty) {
        orderListBody.innerHTML = `<tr><td colspan="3" class="text-center text-gray-500">Chưa có đơn hàng nào.</td></tr>`;
        return;
      }

      let ordersHTML = '';
      querySnapshot.forEach(doc => {
        const order = doc.data();
        const formattedPrice = order.totalPrice ? order.totalPrice.toLocaleString('vi-VN') + ' VND' : 'N/A';
        ordersHTML += `
          <tr>
            <td>${order.customerEmail || 'Không có email'}</td>
            <td>${formattedPrice}</td>
            <td>
              <span class="px-3 py-1 text-sm font-medium rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                ${order.status || 'Pending'}
              </span>
            </td>
          </tr>
        `;
      });
      orderListBody.innerHTML = ordersHTML;
    }, (error) => {
      console.error("Lỗi khi tải đơn hàng: ", error);
      orderListBody.innerHTML = `<tr><td colspan="3" class="text-center text-red-500">Không thể tải danh sách đơn hàng.</td></tr>`;
    });
  };


  // ================================== //
  //        GỌI CÁC HÀM KHỞI TẠO        //
  // ================================== //
  fetchProducts();
  fetchOrders();
});