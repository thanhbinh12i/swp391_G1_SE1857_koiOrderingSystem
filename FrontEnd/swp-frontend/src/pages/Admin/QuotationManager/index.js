import { Badge, Button, Card, Col, Form, Input, Modal, Pagination, Row } from "antd";
import { useEffect, useState } from "react";
import { get, put } from "../../../utils/request";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

function QuotationManager() {
  const [quotation, setQuotation] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalVisibility, setModalVisibility] = useState({});
  const [form] = Form.useForm();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    return quotation.slice(startIndex, startIndex + pageSize);
  };

  const fetchApi = async () => {
    const response = await get("quotation/view-all");
    if (response) {
      const quotationsWithTours = await Promise.all(
        response.map(async (quotation) => {
          const tourResponse = await get(`tour/view-tourId/${quotation.tourId}`);
          return {
            ...quotation,
            tourDetail: tourResponse
          };
        })
      );
      setQuotation(quotationsWithTours.reverse());
    }
  };
  useEffect(() => {
    fetchApi();
  }, []);
  const showModal = (id) => {
    setModalVisibility((prev) => ({ ...prev, [id]: true, }));
  };

  const updatePrice = async (values, id) => {
    const getTimeCurrent = () => {
      return new Date().toLocaleString();
    };
    const quotationData = {
      priceOffer: values.priceOffer,
      status: "Báo giá cho quản lý",
      approvedDate: getTimeCurrent(),
      description: "",
    };
    const response = await put(`quotation/update/${id}`, quotationData);
    if (response) {
      setModalVisibility((prev) => ({ ...prev, [id]: false, }));
      Swal.fire({
        icon: "success",
        title: "Nhập giá thành công!!!",
      });
      fetchApi();
    }
  };

  const handleCancel = (id) => {
    setModalVisibility((prev) => ({ ...prev, [id]: false, }));
  };
  const handleSuccess = async (quotationId, priceOffer) => {
    const getTimeCurrent = () => {
      return new Date().toLocaleString();
    };
    const quotationData = {
      priceOffer: priceOffer,
      status: "Xác nhận báo giá",
      approvedDate: getTimeCurrent(),
      description: messages[quotationId] || "",
    };
    const response = await put(`quotation/update/${quotationId}`, quotationData);
    if (response) {
      fetchApi();
      Swal.fire({
        icon: "success",
        title: "Xác nhận báo giá!!!",
      });
    }
  };
  const handleCancelBooking = async (item) => {
    try {
      setLoading(true);
      const cancellationTemplate = CancelTemplate({ item });
      const getTimeCurrent = () => {
        return new Date().toLocaleString();
      };
      const quotationData = {
        priceOffer: item.priceOffer,
        status: "Đã hủy",
        approvedDate: getTimeCurrent(),
        description: item.description,
      };
      const response = await put(`quotation/update/${item.quotationId}`, quotationData);
      if (response) {
        fetchApi();
        const emailData = {
          toEmail: item.email,
          subject: `Xác nhận hủy đơn đặt chỗ - Mã đơn ${item.quotationId}`,
          message: cancellationTemplate,
        };
        const responseEmail = await fetch(`${process.env.REACT_APP_API_URL}email/send`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailData),
          }
        );
        if (responseEmail) {
          Swal.fire({
            icon: "success",
            title: "Đã gửi!!!",
          });
        }
      }
    } catch (error) {
      console.error("Lỗi khi gửi email:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>

      {quotation.length > 0 ? (
        <>
          <Row gutter={[20, 20]}>

            {getCurrentPageData().map((item) => (
              <Col span={8} key={item.quotationId}>
                <Card
                  title={
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    >
                      <span> Xác nhận báo giá </span>
                      <Link to={`/quotation-detail/${item.tourId}`}>
                        <Button type="primary">
                          Xem chi tiết
                        </Button>
                      </Link>
                    </div>
                  }
                >
                  <p>
                    Họ và tên: <strong> {item.fullName} </strong>
                  </p>
                  <p>
                    Email: <strong> {item.email} </strong>
                  </p>
                  <p>
                    Số điện thoại: <strong> {item.phoneNumber} </strong>
                  </p>
                  <p>
                    Chuyến đi: <strong> {item.tourDetail.tourName} </strong>
                  </p>
                  <p>
                    Giá tiền:
                    <strong> {item.priceOffer.toLocaleString()} đ </strong>
                  </p>
                  {item.description !== "" && (
                    <p>
                      Lời nhắn: <strong> {item.description} </strong>
                    </p>
                  )}
                  <p>
                    <Badge status="success" text={item.status} />
                  </p>
                  {item.status === "Báo giá cho quản lý" && (
                    <>
                      <Input.TextArea
                        placeholder="Nhập lời nhắn"
                        value={messages[item.quotationId] || ""}
                        onChange={(e) =>
                          setMessages((prev) => ({
                            ...prev,
                            [item.quotationId]: e.target.value,
                          }))
                        }
                        style={{ marginBottom: "10px", }} />
                      <Button type="primary" onClick={() => handleSuccess(item.quotationId, item.priceOffer)} className="mr-10">
                        Xác nhận
                      </Button>
                      <Button type="primary" onClick={() => showModal(item.quotationId)}>
                        Nhập lại giá
                      </Button>
                      <Modal
                        title="Nhập giá tiền cho chuyến đi"
                        visible={modalVisibility[item.quotationId]}
                        onCancel={() => handleCancel(item.quotationId)}
                        footer={null}
                      >
                        <Form
                          onFinish={(values) => updatePrice(values, item.quotationId)}
                          layout="vertical"
                          form={form}
                        >
                          <Form.Item
                            name="priceOffer"
                            label="Nhập giá tiền"
                            rules={[{ required: true, message: "Vui lòng nhập giá tour!" },
                            {
                              required: true,
                              pattern: /^[1-9]\d*$/,
                              message: 'Vui lòng nhập số lớn hơn 0 và không chứa ký tự đặc biệt'
                            }
                            ]}
                          >
                            <Input
                              style={{ width: "100%" }}
                              placeholder="Nhập giá tour"
                            />
                          </Form.Item>
                          <Form.Item>
                            <Button type="primary" htmlType="submit">
                              Nhập giá
                            </Button>
                          </Form.Item>
                        </Form>
                      </Modal>
                    </>
                  )}
                  {item.status === "Yêu cầu hủy đặt chỗ" && (
                    <Button type="primary" onClick={() => handleCancelBooking(item)} loading={loading}>
                      Xác nhận hủy
                    </Button>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Pagination
              current={currentPage}
              onChange={(page) => setCurrentPage(page)}
              total={quotation.length}
              pageSize={pageSize}
              showSizeChanger={false}
              showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} đặt chỗ`}
            />
          </div>
        </>
      ) : (
        <>
          <h1> Không có báo giá nào </h1>
        </>
      )}
    </>
  );
}
export default QuotationManager;

const CancelTemplate = (props) => {
  const { item } = props;
  const refundAmount = item.priceOffer - 10000000;
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "đ");
  };

  return `
  <html>
      <head>
          <meta charset="UTF-8" />
          <style>
              body {
                  background-color: #f0f7ff;
                  margin: 0;
                  padding: 40px 0;
                  font-family: 'Arial', sans-serif;
              }
              .cancellation-email {
                  background-color: #ffffff;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 30px;
                  border-radius: 15px;
                  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                  border: 1px solid black;
              }
              h2 { 
                  color: #1677ff;
                  text-align: center;
                  font-size: 24px;
                  margin-bottom: 25px;
                  padding-bottom: 15px;
                  border-bottom: 2px solid #e6f4ff;
              }
              .order-details {
                  background-color: #f8fbff;
                  padding: 20px;
                  margin: 20px 0;
                  border-radius: 10px;
                  border: 1px solid #e6f4ff;
              }
              .order-details h3 {
                  color: #1677ff;
                  margin-top: 0;
                  font-size: 18px;
              }
              .currency { 
                  font-weight: bold;
                  color: #2f54eb;
              }
              .currency.refund { 
                  color: #52c41a;
                  font-size: 1.1em;
              }
              .footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 2px solid #e6f4ff;
                  font-size: 12px;
                  color: #8c8c8c;
                  text-align: center;
              }
              .greeting {
                  color: #1677ff;
                  font-weight: bold;
              }
              .order-id {
                  background-color: #e6f4ff;
                  padding: 3px 8px;
                  border-radius: 4px;
                  color: #1677ff;
                  font-weight: bold;
              }
              .details-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 10px 0;
                  padding: 5px 0;
                  border-bottom: 1px dashed #e6f4ff;
              }
              .details-label {
                  color: #595959;
                  font-weight: bold;
              }
              .signature {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #e6f4ff;
                  color: #1677ff;
                  font-style: italic;
              }
          </style>
      </head>
      <body>
          <div class="cancellation-email">
              <h2>✨ Xác nhận hủy đơn đặt chỗ ✨</h2>

              <p><span class="greeting">Kính gửi Quý khách,</span></p>

              <p>Chúng tôi xác nhận đã nhận được yêu cầu hủy đơn đặt chỗ của Quý khách với mã đơn <span class="order-id">${item.quotationId
    }</span></p>

              <div class="order-details">
                  <h3>🗒️ Chi tiết đơn hàng</h3>
                  <div class="details-row">
                      <span class="details-label">Mã chuyến đi: </span>
                      <span>${item.tourId}</span>
                  </div>
                  <div class="details-row">
                      <span class="details-label">Giá tiền: </span>
                      <span class="currency">${formatCurrency(
      item.priceOffer
    )}</span>
                  </div>
                  <div class="details-row">
                      <span class="details-label">Số tiền hoàn lại (50%): </span>
                      <span class="currency refund">${formatCurrency(
      refundAmount
    )}</span>
                  </div>
              </div>

              <p>Theo chính sách của chúng tôi, yêu cầu hủy đơn của Quý khách đã được chấp nhận. Quý khách sẽ được hoàn lại 50% số tiền đã thanh toán, tương đương <span class="currency refund">${formatCurrency(
      refundAmount
    )}</span>.</p>

              <p>Chúng tôi rất tiếc vì sự bất tiện này và hy vọng sẽ có cơ hội phục vụ Quý khách trong tương lai.</p>

              <p>Nếu Quý khách có bất kỳ câu hỏi hoặc thắc mắc nào, xin vui lòng liên hệ với chúng tôi qua:</p>
                  <ul>
                        <li>Hotline: 094 818 2978</li>
                        <li>Email: managerkoidayne@gmail.com</li>
                  </ul>

              <div class="signature">
                  <p>Trân trọng,<br />Koi đây nè ✨</p>
              </div>

              <div class="footer">
                  <p>✨ Koi Dayne - Đồng Hành Cùng Phong Cách Của Bạn ✨</p>
              </div>
          </div>
      </body>
  </html>
`;
};
