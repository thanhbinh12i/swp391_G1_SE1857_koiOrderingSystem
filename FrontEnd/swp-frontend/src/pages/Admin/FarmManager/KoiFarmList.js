import { Table, Button, message, Spin } from "antd";
import { useEffect, useState, useCallback } from "react";
import { get } from "../../../utils/request";
import { PlusOutlined } from "@ant-design/icons";
import CreateKoiFarm from "./CreateKoiFarm";
import DeleteKoiFarm from "./DeleteKoiFarm";
import UpdateKoiFarm from "./UpdateKoiFarm";

function KoiFarmList() {
  const [farms, setFarms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchApi = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get("koiFarm/view-all");
      if (Array.isArray(response)) {
        setFarms(response);
      } else {
        throw new Error("API response is not an array");
      }
    } catch (error) {
      console.error("Error fetching koi farms:", error);
      message.error("Failed to load koi farms. Please try again.");
      setFarms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApi();
  }, [fetchApi]);

  const showModal = () => setIsModalVisible(true);
  const handleOk = () => {
    setIsModalVisible(false);
    fetchApi();
  };
  const handleCancel = () => setIsModalVisible(false);

  const columns = [
    {
      title: "Tên trang trại",
      dataIndex: "farmName",
      key: "farmName",
    },
    {
      title: "Giới thiệu",
      dataIndex: "introduction",
      key: "introduction",
      ellipsis: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Giờ mở cửa",
      dataIndex: "openHour",
      key: "openHour",
      render: (text) => text || "N/A",
    },
    {
      title: "Giờ đóng cửa",
      dataIndex: "closeHour",
      key: "closeHour",
      render: (text) => text || "N/A",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      render: (text) => Number(text).toFixed(1),
    },
    {
      title: "Số điện thoại",
      dataIndex: "hotline",
      key: "hotline",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <>
          <DeleteKoiFarm record={record} handleReload={fetchApi} />
          <UpdateKoiFarm record={record} reload={fetchApi} />
        </>
      ),
    },
  ];

  return (
    <div>
      <Button
        icon={<PlusOutlined />}
        onClick={showModal}
        style={{ marginBottom: 16 }}
      >
        Thêm trang trại cá Koi mới
      </Button>
      <CreateKoiFarm
        isModalVisible={isModalVisible}
        handleOk={handleOk}
        handleCancel={handleCancel}
      />
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={farms}
          rowKey="farmId"
          bordered
          scroll={{ x: "max-content" }}
        />
      </Spin>
    </div>
  );
}

export default KoiFarmList;