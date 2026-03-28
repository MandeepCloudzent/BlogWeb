from rest_framework.pagination import PageNumberPagination, CursorPagination


class PostPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50


class CommentCursorPagination(CursorPagination):
    page_size = 20
    ordering = 'created_at'
