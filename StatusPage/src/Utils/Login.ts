import UserUtil from './User';
import Email from 'Common/Types/Email';
import ObjectID from 'Common/Types/ObjectID';
import { JSONObject } from 'Common/Types/JSON';
import JSONFunctions from 'Common/Types/JSONFunctions';
import StatusPagePrivateUser from 'Model/Models/StatusPagePrivateUser';

export default abstract class LoginUtil {
    public static login(value: JSONObject): void {
        const user: StatusPagePrivateUser = JSONFunctions.fromJSON(
            value['user'] as JSONObject,
            StatusPagePrivateUser
        ) as StatusPagePrivateUser;

        const statusPageId: ObjectID = user.statusPageId!;

        UserUtil.setEmail(statusPageId, user.email as Email);
        UserUtil.setUserId(statusPageId, user.id as ObjectID);
    }
}
