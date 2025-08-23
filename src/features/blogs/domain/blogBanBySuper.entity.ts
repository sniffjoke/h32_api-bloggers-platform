import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BlogEntity } from './blogs.entity';


@Entity('blogBanBySuper')
export class BlogBanBySuperEntity {

    @PrimaryGeneratedColumn()
    id: string;

    @Column({default: false})
    isBanned: boolean

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    banDate: string;

    @OneToOne(() => BlogEntity, (blog) => blog.banInfo)
    blog: BlogEntity;

}
