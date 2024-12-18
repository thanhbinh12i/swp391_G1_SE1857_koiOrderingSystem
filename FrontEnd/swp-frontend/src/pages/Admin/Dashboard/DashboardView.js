import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Table, Select, Divider } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Line, Column } from "@ant-design/plots";
import "./Dashboard.scss";
import { get } from "../../../utils/request.js";

const DashboardView = () => {
  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);
  const [bestTours, setBestTours] = useState([]);
  const [bestKois, setBestKois] = useState([]);
  const [koiBills, setKoiBills] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [tours, setTours] = useState([]);
  const [chartType, setChartType] = useState("daily");

  useEffect(() => {
    fetchData();
  }, [bestKois, bestTours]);

  const fetchData = async () => {
    try {
      const [usersData, billsData, koiBillsData, quotationsData, toursData] =
        await Promise.all([
          get("account/view-all-user"),
          get("bill/view-all"),
          get("koi-bill/view-all"),
          get("quotation/view-all"),
          get("tour/view-all"),
        ]);

      setUsers(usersData);
      setBills(billsData);
      setKoiBills(koiBillsData);
      setQuotations(quotationsData);
      setTours(toursData);

      const [koiStats, tourStats] = await Promise.all([
        processKoiSales(koiBills, bills),
        processTourBookings(bills, tours, quotations),
      ]);

      setBestKois(koiStats);
      setBestTours(tourStats);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getTourNameById = (tourId, tours) => {
    const tour = tours.find((t) => t.tourId === tourId);
    return tour ? tour.tourName : "Unknown Tour";
  };

  const processTourBookings = (bills, tours, quotations) => {
    const tourBookings = {};

    bills.forEach((bill) => {
      if (bill.quotationId) {
        const quotation = quotations.find(
          (q) => q.quotationId === bill.quotationId
        );
        if (quotation && quotation.tourId) {
          const tourName = getTourNameById(quotation.tourId, tours);
          if (!tourBookings[tourName]) {
            tourBookings[tourName] = {
              name: tourName,
              bookings: 0,
              revenue: 0,
            };
          }
          tourBookings[tourName].bookings += 1;
          tourBookings[tourName].revenue += bill.tourPrice || 0;
        }
      }
    });

    return Object.values(tourBookings)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((tour, index) => ({
        ...tour,
        key: index,
        rank: index + 1,
      }));
  };

  const processKoiSales = (koiBills, bills) => {
    const koiSales = {};
    bills.forEach((bills) => {
      koiBills.forEach((bill) => {
        if (bill.billId === bills.billId) {
          const koiName = bill.koiName || "Unknown Koi";
          if (bills.koiPrice !== null) {
            koiSales[koiName] = {
              name: koiName,
              sales: bill.quantity,
              revenue: bill.finalPrice * bill.quantity,
            };
          }
        }
      });
    });

    return Object.values(koiSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((koi, index) => ({
        ...koi,
        key: index,
        rank: index + 1,
      }));
  };

  const totalRevenue = bills.reduce(
    (sum, bill) => sum + (bill.koiPrice || 0) + (bill.tourPrice || 0),
    0
  );

  const processChartData = () => {
    const dailyStats = {};
    const monthlyStats = {};

    bills.forEach((bill) => {
      if (bill.paymentDate) {
        // Danh thu theo ngày
        const date = new Date(bill.paymentDate).toLocaleDateString("vi-VN");
        if (!dailyStats[date]) {
          dailyStats[date] = { totalRevenue: 0 };
        }
        dailyStats[date].totalRevenue +=
          (bill.tourPrice ? bill.tourPrice : 0) +
          (bill.koiPrice ? bill.koiPrice : 0);

        // Danh thu theo tháng
        const monthKey = new Date(bill.paymentDate).toLocaleDateString(
          "vi-VN",
          {
            year: "numeric",
            month: "long",
          }
        );
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = { totalRevenue: 0 };
        }
        monthlyStats[monthKey].totalRevenue +=
          (bill.tourPrice ? bill.tourPrice : 0) +
          (bill.koiPrice ? bill.koiPrice : 0);
      }
    });

    if (chartType === "monthly") {
      return Object.entries(monthlyStats)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([date, stats]) => ({
          date,
          value: stats.totalRevenue,
        }));
    } else {
      return Object.entries(dailyStats)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([date, stats]) => ({
          date,
          value: stats.totalRevenue,
        }));
    }
  };

  const config = {
    data: processChartData(),
    xField: "date",
    yField: "value",
    ...(chartType === "monthly"
      ? {
        seriesField: undefined,
        label: {
          position: "top",
          style: {
            fill: "#000000",
          },
          formatter: (datum) => {
            return datum.value === null || isNaN(datum.value)
              ? ""
              : new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(datum.value);
          },
        },
        xAxis: {
          label: {
            autoRotate: false,
            autoHide: false,

            autoEllipsis: false,
          },
        },
        meta: {
          value: {
            formatter: (value) => {
              return value === null || isNaN(value)
                ? ""
                : new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(value);
            },
          },
        },
      }
      : {}),
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    style: {
      lineWidth: 2,
    },
    legend: false,
    animation: {
      appear: {
        animation: "path-in",
        duration: 1000,
      },
    },
    color: ["#1979C9"],
  };
  const columns = {
    tours: [
      {
        title: "No",
        dataIndex: "rank",
        key: "rank",
        width: 60,
        render: (rank) => (
          <span>
            {rank === 1 && <TrophyOutlined style={{ color: "#FFD700" }} />}
            {rank === 2 && <TrophyOutlined style={{ color: "#C0C0C0" }} />}
            {rank === 3 && <TrophyOutlined style={{ color: "#CD7F32" }} />}
            {rank > 3 && rank}
          </span>
        ),
      },
      {
        title: "Tên chuyến đi",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
      },
      {
        title: "Số lượng booking",
        dataIndex: "bookings",
        key: "bookings",
        width: 150,
        align: "right",
      },
      {
        title: "Doanh thu",
        dataIndex: "revenue",
        key: "revenue",
        width: 120,
        align: "right",
        render: (value) =>
          new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(value),
      },
    ],
    kois: [
      {
        title: "No",
        dataIndex: "rank",
        key: "rank",
        width: 60,
        render: (rank) => (
          <span>
            {rank === 1 && <TrophyOutlined style={{ color: "#FFD700" }} />}
            {rank === 2 && <TrophyOutlined style={{ color: "#C0C0C0" }} />}
            {rank === 3 && <TrophyOutlined style={{ color: "#CD7F32" }} />}
            {rank > 3 && rank}
          </span>
        ),
      },
      {
        title: "Tên cá Koi",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
      },
      {
        title: "Số lượng bán",
        dataIndex: "sales",
        key: "sales",
        width: 130,
        align: "right",
      },
      {
        title: "Doanh thu",
        dataIndex: "revenue",
        key: "revenue",
        width: 120,
        align: "right",
        render: (value) =>
          new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(value),
      },
    ],
  };

  return (
    <div className="dashboard">
      <Row gutter={16} className="stats-cards">
        <Col span={8}>
          <Card style={{ backgroundColor: "#57b0ea" }}>

            <Statistic
              title="Tổng số người dùng"
              value={users.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ backgroundColor: "#ff7f07" }}>

            <Statistic
              title="Tổng số đơn hàng"
              value={bills.length}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ backgroundColor: "#4ae84d" }} >
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              precision={0}
              prefix={<DollarOutlined />}
              formatter={(value) =>
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(value)
              }
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Biểu đồ doanh thu"
        className="revenue-chart"
        extra={
          <Select
            defaultValue="daily"
            style={{ width: 120 }}
            onChange={setChartType}
            options={[
              { value: "daily", label: "Theo ngày" },
              { value: "monthly", label: "Theo tháng" },
            ]}
          />
        }
      >
        {chartType === "monthly" ? (
          <div className="Column-chart">
            <Column {...config} />
          </div>
        ) : (
          <Line {...config} />
        )}
      </Card>
      <Divider />
      <Row gutter={16} className="best-selling">
        <Col span={12}>
          <Card title="Top 10 cá Koi bán chạy">
            <Table
              columns={columns.kois}
              dataSource={bestKois}
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top 5 chuyến đi có doanh thu cao">
            <Table
              columns={columns.tours}
              dataSource={bestTours}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardView;
