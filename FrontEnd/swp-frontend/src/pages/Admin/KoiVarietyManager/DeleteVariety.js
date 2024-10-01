import { Button, Popconfirm, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons"
import { del } from "../../../utils/request";

function DeleteVariety(props) {
      const {record, handleReload} = props;
      const handleDelete = async () => {
            const response = await del("koi-variable/delete", record.id);
            if(response){
                  handleReload();
            }
      }
      return (
            <>
                  <Tooltip title="Xóa">
                        <Popconfirm title="Bạn chắc chắn có muốn xóa không?" onConfirm={handleDelete}>
                              <Button className="ml-5" danger ghost icon={<DeleteOutlined />}></Button>
                        </Popconfirm>
                  </Tooltip>
            </>
      )
}
export default DeleteVariety;