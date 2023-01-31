const httpStatus = require("../utils/httpStatus");
const PostModel = require("../models/Posts");

const postLikeController = {};

postLikeController.action = async (req, res, next) => {
  try {
    // Lấy id người dùng từ token
    let userId = req.userId;

    // Kiểm tra sự tồn tại của id bài viết
    let post = await PostModel.findById(req.params.postId);
    if (post == null) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Can not find post" });
    }

    // Gán mảng các thông tin người dùng đã like bài viết
    let arrLike = post.like;
    // Kiểm tra xem người dùng hiện tại đã like bài viết chưa
    let arrLikeNotContainCurrentUser = arrLike.filter((item) => {
      return item._id != userId;
    });
    // Nếu chưa like => Thêm id vào
    if (arrLikeNotContainCurrentUser.length === arrLike.length) {
      arrLike.push(userId);
    } else {
      // Nếu like rồi => Bỏ id đi
      arrLike = arrLikeNotContainCurrentUser;
    }

    // Cập nhật bài viết
    post = await PostModel.findOneAndUpdate(
      { _id: req.params.postId },
      {
        like: arrLike,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("like", ["username", "phonenumber"]);

    if (!post) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Can not find post" });
    }

    // Cập nhật trạng thái ban đầu của nút like
    post.like.forEach((element) => {
      if (element._id == req.userId) {
        post.isLike = true;
      } else {
        post.isLike = false;
      }
    });

    return res.status(httpStatus.OK).json({
      data: post,
    });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

module.exports = postLikeController;
