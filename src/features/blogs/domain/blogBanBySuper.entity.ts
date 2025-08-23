import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { BlogEntity } from './blogs.entity';


@Entity('blogBanBySuper')
export class BlogBanBySuperEntity {

    @PrimaryColumn()
    blogId: string;

    @Column({default: false})
    isBanned: boolean

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    banDate: string;

    @OneToOne(() => BlogEntity, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'blogId' })
    blog: BlogEntity;

}
