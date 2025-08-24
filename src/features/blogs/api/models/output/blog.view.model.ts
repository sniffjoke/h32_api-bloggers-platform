import {CommentatorInfoModel} from "../../../../comments/api/models/output/comment.view.model";

export class BlogViewModel {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
    isMembership: boolean;
    blogOwnerInfo?: CommentatorInfoModel;
    // banInfo: BanBlogInfoViewModel;
}
